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
} from "@mui/material";
import { useRef, useState } from "react";
import { Error } from "@/components/Error";
import { makeStyles, useTheme } from "@mui/styles";
import { Cancel } from "@mui/icons-material";
import NavBar from "@/components/Navbar";
import VerifyBadge from "@/components/VerifyBadge";
import { forwardRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const useStyles = makeStyles((theme) => ({
  root: {
    padding: "30px",
    minHeight: "91.5vh",
    lineHeight: "1.5",
  },
  certHeader: {
    backgroundColor: "white",
    background: "linear-gradient(109.96deg,#363e98,#8ac6ff),#fff",
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
}));

const Page = () => {
  const params = useParams();
  const id = params.id;
  const classes = useStyles();
  const [certExist, setCertExist] = useState(true);
  const [loading, setloading] = useState(false);
  console.log(id);
  const certicateRef = useRef(null)
  //function for dowloading certificate as pdf
  const handleDownloadPdf =()=>{
    const input = certicateRef.current; 
    console.log("started certificate");
    if(input){
      html2canvas(input, {scale:2}).then((canvas)=>{
        const imgdata = canvas.toDataURL("image/png"); 
        const pdf = new jsPDF("p", "mm", "a4"); 
        const imgWidth = 210; 
        const imgHeight = (canvas.height *imgWidth) /canvas.width; 
        pdf.addImage(imgdata, "PNG",0,0, imgWidth,imgHeight); 
        pdf.save("certificate.pdf");
      })
    }
  }
  return (
    <>
      <NavBar />
      <Grid container className={classes.root} justifyContent={"center"}>
        <Grid xs={12} sm={8}>
          {loading && <p>loading...</p>}
          {!loading && !certExist && (
            <Error
              notFound
              messsage={"Certificate do not exists"}
              label="Please Enter a Valid Id"
              buttonText="Okay"
            />
          )}
          {!loading && certExist && (
            <Certtificate
              id={id}
              candidateName={"Raj "}
              courseName={"Data Science"}
              creationDate={"25-02-2023"}
              instituteName={"Kaziranga University"}
              instituteAcronym={"KU"}
              institutelink={"www.ku.com"}
              revoked={false}
              ref={certicateRef}
              logo={
                "https://www.bing.com/images/search?q=kaziranga%20university%20logo&FORM=IQFRBA&id=B5A8EB5155D2D93064F4E758F1A7C89A82CD6627"
              }
            />
          )}
          {!loading && certExist && (
            <Box style={{display:'flex', flexDirection:'row', }}>
                <Button onClick={handleDownloadPdf} variant={"text"} color="primary" style={{width:"100%",  padding:10, marginTop:"10px", alignItems:"center", justifyItems:"center"}}>
              Dowload as Pdf
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
              <Typography variant="h5">
                What are Verified Credentials?
              </Typography>
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
              <Typography variant="h5">
                What are Revoked Credentials?
              </Typography>
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
              href="javascript:void(0)"
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
  ({
  id,
  candidateName,
  courseName,
  creationDate,
  instituteName,
  instituteAcronym,
  institutelink,
  revoked,
},ref) => {
  const classes = useStyles();
  const dateObject = new Date(creationDate);
  const day = dateObject.toLocaleString("en-us", { day: "numeric" });
  const month = dateObject.toLocaleString("en-us", { month: "long" });
  const year = dateObject.toLocaleString("en-us", { yaer: "numeric" });
  const formatteddate = `${day} ${month} ${year}`;

  return (
    <>
      <Paper className={classes.paper} ref={ref}>
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
          </Grid>
          <Grid item xs={12} className={classes.certMidSection}>
            <Grid container>
              <Grid item xs={12} lg={6}>
                <DetailGroup label={"Course Name"} content={courseName} />
              </Grid>
              <Grid item xs={12} lg={6}>
                <DetailGroup label={"Institute Name"} content={instituteName} />
              </Grid>
              <Grid item xs={12} lg={6}>
                <DetailGroup
                  label={"Institute Acronym"}
                  content={instituteAcronym}
                />
              </Grid>
              <Grid item xs={12} lg={6}>
                <DetailGroup label={"Institute Link"} content={institutelink} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={12} className={classes.certBottomSection}>
          <Grid container>
              <Grid item xs={12} lg={6}>
                <DetailGroup label={"Issuance Date"} content={creationDate} />
              </Grid>
              <Grid item xs={12} lg={6}>
                <DetailGroup label={"Certificate Id"} content={id} />
              </Grid>
              </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
)

export default Page;
