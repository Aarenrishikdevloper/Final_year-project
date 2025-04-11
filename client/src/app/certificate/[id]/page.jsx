"use client";
import { useParams } from "next/navigation";
import {
  Grid,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  Typography,
  Button,
  Grid2,
} from "@mui/material";
import { useEffect, useRef, useState, useImperativeHandle } from "react";
import { Error } from "@/components/Error";
import { makeStyles, useTheme } from "@mui/styles";
import { Cancel } from "@mui/icons-material";
import NavBar from "@/components/Navbar";
import VerifyBadge from "@/components/VerifyBadge";
import { forwardRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Web3 from "web3";
import QRCode from "qrcode";
import Certification from "../../../../../build/contracts/Certification.json";
import { decrypt } from "@/utils/decrypt";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "30px",
    minHeight: "91.5vh",
    lineHeight: "1.5",
  },
  certHeader: {
    backgroundColor: "white",
    background:
      "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
    padding: "24px",
    borderRadius: "10px 10px 0 0 ",
    fontSize: "24px",
    fontWeight: "400",
    color: "white",
  },
  certTopSection: {
    backgroundColor: "white",
    padding: "24px",
  },
  certMidSection: {
    backgroundColor: "white",
    padding: "24px",
    borderTop: "1px solid #6066af",
    borderBottom: "1px solid #6066af",
  },
  certBottomSection: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "0 0 10px 10px",
  },
  paper: {
    marginTop: "30px",
    flexDirection: "column",
    alignItems: "center",
    padding: "0px",
    borderRadius: "10px",
  },
  verificationBox: {
    backgroundColor: (props) => (props.revoked ? "#dd7e7e" : "#7ed7dd"),
    borderRadius: "5px 0 0 5px",
    marginRight: "-24px",
    padding: "12px 8px",
    alignItems: "center",
  },
  verificationStatus: {
    fontSize: "22px",
    lineHeight: "20px",
    fontWeight: "600",
    color: "white",
  },
  verificationDialog: {
    backgroundColor: (props) => (props.revoked ? "#dd7e7e" : "#7ed7dd"),
    background: (props) =>
      props.revoked
        ? "linear-gradient(129deg, rgba(221,126,173,1) 0%, rgba(221,126,126,1) 75%)"
        : "linear-gradient(124deg, rgba(126,170,221,1) 0%, rgba(126,215,221,1) 76%)",
    color: "white",
  },
  qrCodeContainer: {
    display: "flex",
    // justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    marginTop: "16px",
  },
  qrCodeLabel: {
    textAlign: "center",
    marginTop: "12px",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
  },
}));

const Page = () => {
  const params = useParams();
  const id = params.id;
  const classes = useStyles();
  const [certificateData, setCertificateData] = useState(null);
  const [certExist, setCertExist] = useState(true);
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef(null);

  // Initialize Web3 and contract
  const connectWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Certification.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        Certification.abi,
        deployedNetwork && deployedNetwork.address
      );
      return { web3, contractInstance };
    } else {
      throw new Error("Please install MetaMask!");
    }
  };

  // Fetch certificate data
  const fetchCertificateData = async () => {
    try {
      setLoading(true);
      const { contractInstance } = await connectWeb3();

      const data = await contractInstance.methods.getData(id).call();
      if (!data || !data[0]) {
        setCertExist(false);
        return;
      }

      console.log(data);
      const encryptionKey = "your-secret-key"; // SAME key used during encryption
      const encryptedDate = data[4];
      //decrypting data
      const decryptedDate = decrypt(encryptedDate, encryptionKey);

      //debugging log
      console.log("Decrypted Date:", decryptedDate);

      //formatting decrypted date
      const timestamp = Number(decryptedDate);
      const date = new Date(timestamp);
      const formattedDate = `${date.getDate()} / ${
        date.getMonth() + 1
      } / ${date.getFullYear()}`;

      console.log("Formatted Date:", formattedDate);

      // Update state with fetched data - documentUri is now last
      setCertificateData({
        candidateName: data[0],
        candidateEmail: data[1],
        candidateId: data[2],
        courseName: data[3],
        creationDate: formattedDate,
        instituteName: data[6],
        instituteAcronym: data[7],
        instituteLink: data[8],
        instituteGovId: data[9],
        documentUri: data[5], // Moved to last position
        revoked: data[10],
      });
      setCertExist(true);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      setCertExist(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateData();
  }, [id]);

  // Function for downloading QR code as PNG
  const handleDownloadQR = () => {
    if (certificateRef.current) {
      const qrCanvas = certificateRef.current.getQRCodeCanvas();
      if (qrCanvas) {
        // Create a temporary higher resolution canvas for download
        const tempCanvas = document.createElement("canvas");
        const scale = 2; // Double resolution for download
        tempCanvas.width = qrCanvas.width * scale;
        tempCanvas.height = qrCanvas.height * scale;
        const ctx = tempCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qrCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

        const link = document.createElement("a");
        link.download = `certificate-qr-${id}.png`;
        link.href = tempCanvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <>
      <NavBar />
      <Grid container className={classes.root} justifyContent={"center"}>
        <Grid xs={12} sm={8}>
          {loading && <p>Loading...</p>}
          {!loading && !certExist && (
            <Error
              notFound
              message={
                "Certificate does not exist. Try using a Metamask installed browser"
              }
              buttonText="Okay"
            />
          )}
          {!loading && certExist && certificateData && (
            <Certtificate
              id={id}
              candidateName={certificateData.candidateName}
              candidateEmail={certificateData.candidateEmail}
              candidateId={certificateData.candidateId}
              courseName={certificateData.courseName}
              creationDate={certificateData.creationDate}
              instituteName={certificateData.instituteName}
              instituteAcronym={certificateData.instituteAcronym}
              institutelink={certificateData.instituteLink}
              instituteGovId={certificateData.instituteGovId}
              documentUri={certificateData.documentUri}
              revoked={certificateData.revoked}
              ref={certificateRef}
            />
          )}
          {!loading && certExist && certificateData && (
            <Box style={{ display: "flex", flexDirection: "row" }}>
              <Button
                onClick={handleDownloadQR}
                variant={"text"}
                color="primary"
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: "10px",
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                Download QR Code
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

function SimpleDialog(props) {
  const classes = useStyles(props);
  const { onClose, open, selectedValue, revoked } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <div className={classes.verificationDialog}>
        {!revoked && (
          <>
            <DialogTitle id="simple-dialog-title">
              <div>
                <Typography variant="h5">
                  What are Verified Credentials?
                </Typography>
              </div>
            </DialogTitle>
            <DialogContent>
              <Box>
                <b>Verified Credentials (VC)</b> are tamper-proof credentials
                that can be verified cryptographically.
              </Box>
              <Box m={2} />
              <Box>
                There are three essential components of verifiable credentials,
                and they are:
              </Box>
              <Box>✔️ It is machine verifiable</Box>
              <Box>✔️ It is secure and tamper-proof</Box>
              <Box>✔️ Has been issued by a competent authority.</Box>
            </DialogContent>
          </>
        )}

        {revoked && (
          <>
            <DialogTitle id="simple-dialog-title">
              <div>
                <Typography variant="h5">
                  What are Revoked Credentials?
                </Typography>
              </div>
            </DialogTitle>
            <DialogContent>
              <Box>
                <b>Verified Credentials (VC)</b> are tamper-proof credentials
                that can be verified cryptographically.
              </Box>
              <Box m={2} />
              <Box>
                There are three essential components of verifiable credentials,
                and they are:
              </Box>
              <Box>➤ It is machine verifiable</Box>
              <Box>➤ It is secure and tamper-proof</Box>
              <Box>➤ Has been issued by a competent authority.</Box>
              <Box m={3} />
              <Box>
                <b>Revoked Credentials</b> are credentials that are no longer
                valid due to one or more of the following reasons:
              </Box>
              <Box>
                ❌ Candidate has been found to have dishonest conduct throughout
                his/her academic journey, and the credential has been revoked by
                the institute
              </Box>
              <Box>
                ❌ Credential has been issued incorrectly by the institute
              </Box>
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button
            onClick={handleClose}
            autoFocus
            style={{ color: revoked ? "#7ed7dd" : "#dd7e7e" }}
          >
            Close
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}

const VerificationStatus = (props) => {
  const classes = useStyles(props);
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up("md"));

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = (value) => {
    setOpen(false);
  };
  return (
    <>
      <SimpleDialog open={open} onClose={handleClose} revoked={props.revoked} />
      <Box
        className={classes.verificationBox}
        display="flex"
        onClick={handleClickOpen}
      >
        {props.revoked ? <Cancel fontSize="large" /> : <VerifyBadge />}

        {sm && (
          <Box marginLeft="10px">
            <Box className={classes.verificationStatus}>
              {props.revoked ? "Revoked" : "Verified"}
            </Box>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ color: "white", fontSize: "12px" }}
            >
              What does this mean?
            </a>
          </Box>
        )}
      </Box>
    </>
  );
};

const DetailGroup = ({ label, content }) => {
  return (
    <>
      <Box>
        <Box fontSize={16} fontWeight={500} color="#363b98">
          {label}
        </Box>
        <Box m={1} />
        <Box fontSize={18} fontWeight={600} color="#3a3a3a">
          {content}
        </Box>
        <Box m={3} />
      </Box>
    </>
  );
};

const Certtificate = forwardRef(
  (
    {
      id,
      candidateName,
      candidateEmail,
      candidateId,
      courseName,
      creationDate,
      instituteName,
      instituteAcronym,
      institutelink,
      instituteGovId,
      documentUri,
      revoked,
    },
    ref
  ) => {
    const classes = useStyles({ revoked });
    const qrCodeRef = useRef(null);
    const [verificationUrl, setVerificationUrl] = useState("");

    // Expose the QR code canvas to parent component
    useImperativeHandle(ref, () => ({
      getQRCodeCanvas: () => qrCodeRef.current,
    }));

    useEffect(() => {
      // Set the verification URL
      const currentUrl = window.location.origin;
      const url = `${currentUrl}/verify/${id}`;
      setVerificationUrl(url);

      // Generate QR code
      if (qrCodeRef.current) {
        QRCode.toCanvas(
          qrCodeRef.current,
          url,
          {
            width: 256,
            margin: 2,
            errorCorrectionLevel: "H",
            color: {
              dark: "#000000",
              light: "#f8f9fa",
            },
            scale: 4, //higher scale for better quality
          },
          (error) => {
            if (error) console.error("QR code generation error:", error);
          }
        );
      }
    }, [id]);

    return (
      <>
        <Paper className={classes.paper}>
          <Grid container>
            <Grid item xs={12} className={classes.certHeader}>
              University Credentials
            </Grid>
            <Grid item xs={12} className={classes.certTopSection}>
              <Grid
                container
                justifyContent={"space-between"}
                alignItems={"flex-start"}
              >
                <Grid item>
                  <DetailGroup label={"Student Name"} content={candidateName} />
                </Grid>
                <Grid item style={{ marginRight: "10px" }}>
                  <VerificationStatus revoked={revoked} />
                </Grid>
              </Grid>
              <Grid2 item xs={12} className={classes.certTopSection}>
                <Grid item>
                  <DetailGroup label={"Email"} content={candidateEmail} />
                  <DetailGroup label={"ID"} content={candidateId} />
                </Grid>
              </Grid2>
            </Grid>
            <Grid item xs={12} className={classes.certMidSection}>
              <Grid container>
                <Grid item xs={12} lg={6}>
                  <DetailGroup label={"Course Name"} content={courseName} />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <DetailGroup
                    label={"Institute Name"}
                    content={instituteName}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <DetailGroup
                    label={"Institute Acronym"}
                    content={instituteAcronym}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <DetailGroup
                    label={"Institute Link"}
                    content={institutelink}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <DetailGroup
                    label={"Institute Gov ID"}
                    content={instituteGovId}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item sm={12} className={classes.certBottomSection}>
              <Grid container>
                <Grid item xs={12} lg={6}>
                  <DetailGroup label={"Issuance Date"} content={creationDate} />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <DetailGroup
                    label={"Certificate Id"}
                    content={
                      <span
                        style={{
                          fontSize: "14px",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          display: "inline-block",
                          maxWidth: "100%",
                        }}
                      >
                        {id}
                      </span>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box m={2} />
                  <DetailGroup
                    label={"Document Link"}
                    content={
                      <a
                        href={documentUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#363b98",
                          textDecoration: "underline",
                        }}
                      >
                        View Original Document
                      </a>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box m={2} />
                  <DetailGroup
                    label={"Verification QR Code"}
                    content={
                      <Box className={classes.qrCodeContainer}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
                          <canvas ref={qrCodeRef} />
                          <Typography
                            variant="caption"
                            className={classes.qrCodeLabel}
                          >
                            Scan to verify certificate status
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </>
    );
  }
);

export default Page;
