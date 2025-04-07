"use client";
import React, { useEffect, useState } from "react";
import Institution from "../../../../../build/contracts/Institution.json";
import Certification from "../../../../../build/contracts/Certification.json";
import Web3 from "web3";
import {
  TextField,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Button,
  IconButton,
  CircularProgress,
  Box,
  AppBar,
  Tabs,
  Tab,
  styled,
  Container,
  Alert,
  Avatar,
  Card,
  CardContent,
  MenuItem,
  Chip,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  OpenInNewOutlined,
  FileCopyOutlined,
  LoopOutlined,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  AttachFile,
} from "@mui/icons-material";
import { encrypt } from "../../../utils/encrypt.js";
import NavBar from "@/components/Navbar";
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

//initializing clientID
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
});

// Styled Components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.common.white,
  opacity: 1,
  fontSize: "1rem",
  padding: theme.spacing(1.5),
  "&.Mui-selected": {
    color: theme.palette.common.white,
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background:
    "linear-gradient(124deg, rgb(13, 37, 117) 0%, rgb(21, 192, 155) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
  margin: theme.spacing(4, 0, 2),
  textAlign: "center",
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, "auto"),
  maxWidth: 800,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
}));

const GenerateCert = () => {
  const [state, setState] = useState({
    owner: "0x0",
    isCorrectInstitute: false,
    renderLoading: true,
    renderMetaMaskError: false,
    networkError: false,
    instituteName: "",
    instituteAcronym: "",
    instituteWebsite: "",
    governmentId: "",
    instituteCourses: [],
    firstname: "",
    lastname: "",
    isLegitInstitute: null,
    currentState: "normal",
    certificateId: "",
    courseIndex: 0,
    creationDate: null,
    txnFailed: false,
    tabValue: 0,
    revokeCertificateId: "",
    revokeCurrentState: "normal",
    revokeTxnFailed: false,
    //adding neccesary states for uploading pdf to IPFS
    certificateFile: null,
    ipfsUri: "",
    isUploading: false,
  });

  // Load Web3 and check address
  useEffect(() => {
    loadWeb3Metamask();
  }, []);

  const loadWeb3Metamask = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      setState((prev) => ({ ...prev, renderMetaMaskError: false }));
      checkAddressAndGetCourses();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      setState((prev) => ({ ...prev, renderMetaMaskError: false }));
      checkAddressAndGetCourses();
    } else {
      toast.warning(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      setState((prev) => ({
        ...prev,
        renderLoading: false,
        renderMetaMaskError: true,
      }));
    }
  };

  const checkAddressAndGetCourses = async () => {
    const web3 = window.web3;
    if (!web3) return;

    const accounts = await web3.eth.getAccounts();
    const caller = accounts[0];

    let networkId;
    try {
      networkId = await web3.eth.net.getId();
    } catch (err) {
      toast.warning(
        "Please make sure you are connected to the correct network"
      );
      setState((prev) => ({
        ...prev,
        renderLoading: false,
        networkError: true,
      }));
      return;
    }

    if (!(networkId in Institution.networks)) {
      toast.warning(
        "Please make sure you are connected to the correct network"
      );
      setState((prev) => ({
        ...prev,
        networkError: true,
        renderLoading: false,
      }));
      return;
    }

    const institutionData = Institution.networks[networkId];
    const institution = new web3.eth.Contract(
      Institution.abi,
      institutionData.address
    );

    try {
      const res = await institution.methods
        .getInstituteData()
        .call({ from: caller });
      const formattedInstituteCoursesData = res[4].map((x) => ({
        course_name: x.course_name,
      }));

      setState((prev) => ({
        ...prev,
        instituteName: res[0],
        instituteAcronym: res[1],
        instituteWebsite: res[2],
        governmentId: res[3],
        instituteCourses: formattedInstituteCoursesData,
        isLegitInstitute: true,
        renderLoading: false,
      }));
    } catch (error) {
      toast.warning("You are not authorized to access this page");
      setState((prev) => ({
        ...prev,
        isLegitInstitute: false,
        renderLoading: false,
      }));
    }
  };

  const handleChange = (name) => (event) => {
    setState((prev) => ({
      ...prev,
      [name]: event.target.value,
      currentState: "normal",
      revokeCurrentState: "normal",
    }));
  };

  //adding this function to update the state when certificate is added
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size > 20 * 1024 * 1024) {
          // 20MB limit
          toast.warning("PDF file size should be less than 20MB");
          return;
        }
        setState((prev) => ({
          ...prev,
          certificateFile: file,
          ipfsUri: "", // Reset URI when new file is selected
        }));
      } else {
        toast.warning("Please upload a valid PDF file");
      }
    }
  };

  //uploading file to IPFS
  const uploadFile = async () => {
    if (!state.certificateFile) return;

    setState((prev) => ({ ...prev, isUploading: true }));

    try {
      const uri = await upload({
        client,
        files: [state.certificateFile],
      });

      //debugging log
      console.log("URI: ", uri);

      //replacing URI to gateway URI
      const gatewayUri = `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
      //debugging log
      console.log("Gateway URL: ", gatewayUri);

      setState((prev) => ({
        ...prev,
        ipfsUri: gatewayUri,
        isUploading: false,
      }));
      toast.success("PDF uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setState((prev) => ({ ...prev, isUploading: false }));
      toast.error("Failed to upload PDF");
    }
  };

  const submitData = async (event) => {
    event.preventDefault();
    if (state.currentState === "validate") return;

    setState((prev) => ({ ...prev, currentState: "load" }));

    const { firstname, lastname, candidateEmail, candidateId, courseIndex } =
      state;
    const candidateName = `${firstname} ${lastname}`;
    const creationDate = new Date().getTime();
    const creationDateString = creationDate.toString();

    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const caller = accounts[0];
    const networkId = await web3.eth.net.getId();
    const certificationData = Certification.networks[networkId];
    const certification = new web3.eth.Contract(
      Certification.abi,
      certificationData.address
    );

    try {
      const encryptionKey = "your-secret-key";
      const encryptedDate = encrypt(creationDateString, encryptionKey);

      const transaction = await certification.methods
        .generateCertificate(
          candidateName,
          candidateEmail,
          candidateId,
          courseIndex,
          encryptedDate,
          state.ipfsUri || ""
        )
        .send({ from: caller, gas: 2100000 });

      const event = transaction.events.CertificateGenerated;
      if (event) {
        const certificateId = event.returnValues.certificateId;
        setState((prev) => ({
          ...prev,
          currentState: "validate",
          certificateId: certificateId,
          txnFailed: false,
        }));
        toast.success("Successfully generated certificate!");

        //sending email of successfull certificate generation
        try {
          const response = await fetch("/api/send-certificate-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient: candidateEmail,
              candidateName: candidateName,
              instituteName: instituteName,
              certificateId: certificateId,
              certificateLink: `${window.location.href.slice(
                0,
                -window.location.pathname.length
              )}/certificate/${certificateId}`,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to send email");
          }

          toast.success("Email notification sent to candidate!");
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          toast.warning(
            "Certificate generated but failed to send email notification"
          );
        }
      } else {
        throw new Error("CertificateGenerated event not found.");
      }
    } catch (error) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        currentState: "normal",
        txnFailed: true,
      }));

      if (error.code === -32603) {
        toast.error(
          "Transaction failed. Please check that you have set enough gas limit."
        );
      } else if (error.code === 4001) {
        toast.error("Transaction rejected!");
      }
    }
  };

  const revokeCertificateFunction = async (event) => {
    event.preventDefault();
    if (state.revokeCurrentState === "validate") return;

    setState((prev) => ({ ...prev, revokeCurrentState: "load" }));

    const { revokeCertificateId } = state;
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const caller = accounts[0];
    const networkId = await web3.eth.net.getId();
    const certificationData = Certification.networks[networkId];
    const certification = new web3.eth.Contract(
      Certification.abi,
      certificationData.address
    );

    try {
      // First get certificate details using getData
      const certificateDetails = await certification.methods
        .getData(revokeCertificateId)
        .call();

      // Verify we got the expected data structure
      if (
        !certificateDetails ||
        !certificateDetails[1] ||
        !certificateDetails[0]
      ) {
        throw new Error("Invalid certificate data structure");
      }

      // Then revoke the certificate
      await certification.methods
        .revokeCertificate(revokeCertificateId)
        .send({ from: caller, gas: 2100000 });

      toast.success("Successfully revoked certificate!");
      setState((prev) => ({
        ...prev,
        revokeCurrentState: "validate",
        revokeTxnFailed: false,
      }));

      // Sending revocation email
      try {
        const response = await fetch("/api/send-certificate-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: certificateDetails[1],
            candidateName: certificateDetails[0],
            instituteName: state.instituteName,
            certificateId: revokeCertificateId,
            certificateLink: `${window.location.href.slice(
              0,
              -window.location.pathname.length
            )}/certificate/${revokeCertificateId}`, // Fixed: using revokeCertificateId instead of certificateId
            isRevoked: true, // Added flag for revocation email
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send email");
        }

        toast.success("Revocation email sent to candidate!");
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        toast.warning(
          "Certificate revoked but failed to send email notification"
        );
      }
    } catch (error) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        revokeCurrentState: "normal",
        revokeTxnFailed: true,
      }));

      if (error.code === -32603) {
        toast.error(
          "Revocation Transaction failed. Please check that certificate id exists and you have set enough gas limit."
        );
      } else if (error.code === 4001) {
        toast.error("Revocation Transaction rejected!");
      } else if (error.message.includes("Invalid certificate data structure")) {
        toast.error(
          "Could not retrieve certificate details. Invalid data structure."
        );
      } else {
        toast.error("An unexpected error occurred during revocation");
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setState((prev) => ({ ...prev, tabValue: newValue }));
  };

  const {
    renderLoading,
    renderMetaMaskError,
    networkError,
    instituteName,
    instituteAcronym,
    instituteWebsite,
    governmentId,
    instituteCourses,
    isLegitInstitute,
    firstname,
    lastname,
    candidateEmail,
    candidateId,
    certificateId,
    currentState,
    txnFailed,
    tabValue,
    revokeCertificateId,
    revokeCurrentState,
    revokeTxnFailed,
  } = state;

  if (renderLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Connecting to Blockchain...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (renderMetaMaskError) {
    return (
      <>
        <NavBar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6">MetaMask Required</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You are not using an Ethereum-based browser. Please install
              MetaMask.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
          >
            Install MetaMask
          </Button>
        </Container>
      </>
    );
  }

  if (networkError) {
    return (
      <>
        <NavBar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">Network Error</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please connect to the correct Ethereum network.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            fullWidth
          >
            Try Again
          </Button>
        </Container>
      </>
    );
  }

  if (isLegitInstitute === false) {
    return (
      <>
        <NavBar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: "error.main",
                width: 56,
                height: 56,
                margin: "0 auto 16px",
              }}
            >
              <ErrorIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" color="error" gutterBottom>
              Unauthorized Access
            </Typography>
            <Typography variant="body1" paragraph>
              You are not authorized to access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Only registered institutions can generate certificates.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.location.reload()}
            >
              OK
            </Button>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="lg">
        <GradientText variant="h4">Welcome, Institute</GradientText>

        <FormPaper elevation={3}>
          <AppBar
            position="static"
            sx={{
              background:
                "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
              borderRadius: 1,
            }}
          >
            <StyledTabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="certificate tabs"
              variant="fullWidth"
            >
              <StyledTab label="Generate Certificate" />
              <StyledTab label="Revoke Certificate" />
            </StyledTabs>
          </AppBar>

          <Box sx={{ mt: 3 }}>
            {tabValue === 0 ? (
              <form onSubmit={submitData}>
                <Typography variant="subtitle1" paragraph>
                  Input the certificate details below to generate a certificate
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Institute Name"
                      value={instituteName}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Institute Acronym"
                      value={instituteAcronym}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Institute Website"
                      value={instituteWebsite}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Government ID"
                      value={governmentId}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="First Name"
                      value={firstname}
                      onChange={handleChange("firstname")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Last Name"
                      value={lastname}
                      onChange={handleChange("lastname")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Candidate Email"
                      value={candidateEmail}
                      onChange={handleChange("candidateEmail")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Candidate ID"
                      value={candidateId}
                      onChange={handleChange("candidateId")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={state.courseIndex}
                        onChange={handleChange("courseIndex")}
                        label="Course"
                      >
                        {instituteCourses.map((course, index) => (
                          <MenuItem value={index} key={index}>
                            {course.course_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Updated PDF Upload Section */}
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel shrink={!!state.certificateFile} sx={{position: 'relative', transform: 'none', marginBottom: 1}}>
                        Certificate PDF
                      </InputLabel>
                      <Box display="flex" alignItems="center" gap={2}>
                        <input
                          accept=".pdf"
                          style={{ display: "none" }}
                          id="certificate-pdf-upload"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="certificate-pdf-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<AttachFile />}
                            // sx={{ textTransform: "none", minWidth: 130 }}
                          >
                            Choose PDF
                          </Button>
                        </label>
                        {state.certificateFile && (
                          <Typography variant="body2" noW>
                            {state.certificateFile.name} (
                            {Math.round(state.certificateFile.size / 1024)} KB)
                          </Typography>
                        )}
                      </Box>
                      {state.certificateFile && !state.ipfsUri && (
                        <Button
                          // variant="contained"
                          onClick={uploadFile}
                          disabled={state.isUploading}
                          sx={{ mt: 1 }}
                          startIcon={
                            state.isUploading ? (
                              <CircularProgress size={20} />
                            ) : null
                          }
                        >
                          {state.isUploading ? "Uploading..." : "Upload PDF"}
                        </Button>
                      )}
                      {state.ipfsUri && (
                        <Box mt={1}>
                          <Chip
                            label="PDF Uploaded"
                            color="success"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Button
                            size="small"
                            href={state.ipfsUri}
                            target="_blank"
                            rel="noopener"
                          >
                            View Document
                          </Button>
                        </Box>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center">
                      <SubmitButton
                        type="submit"
                        variant="contained"
                        // color="primary"
                        sx={{
                          background:
                            "linear-gradient(124deg, rgb(129, 255, 228) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
                          // color: "white",
                        }}
                        disabled={currentState === "load"}
                        startIcon={
                          currentState === "load" ? (
                            <CircularProgress size={24} />
                          ) : null
                        }
                      >
                        {currentState === "load"
                          ? "Issuing..."
                          : "Issue Certificate"}
                      </SubmitButton>
                    </Box>

                    {currentState === "validate" && (
                      <Box mt={2} textAlign="center">
                        <Alert
                          icon={<CheckCircle fontSize="inherit" />}
                          severity="success"
                          action={
                            <>
                              <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(certificateId);
                                  toast.success("Copied to clipboard!");
                                }}
                              >
                                <FileCopyOutlined />
                              </IconButton>
                              <Button
                                color="inherit"
                                size="small"
                                endIcon={<OpenInNewOutlined />}
                                onClick={() => {
                                  window.open(
                                    `${window.location.href.slice(
                                      0,
                                      -window.location.pathname.length
                                    )}/certificate/${certificateId}`
                                  );
                                }}
                              >
                                View
                              </Button>
                              <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => {
                                  setState((prev) => ({
                                    ...prev,
                                    currentState: "normal",
                                    firstname: "",
                                    lastname: "",
                                    courseIndex: 0,
                                  }));
                                }}
                              >
                                <LoopOutlined />
                              </IconButton>
                            </>
                          }
                        >
                          Certificate generated with ID: {certificateId}
                        </Alert>
                      </Box>
                    )}

                    {txnFailed && (
                      <Box mt={2}>
                        <Alert severity="error">
                          Failed to generate certificate, please try again.
                        </Alert>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </form>
            ) : (
              <form onSubmit={revokeCertificateFunction}>
                <Typography variant="subtitle1" paragraph>
                  Input the ID of the certificate you want to revoke
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Certificate ID"
                      value={revokeCertificateId}
                      onChange={handleChange("revokeCertificateId")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center">
                      <SubmitButton
                        type="submit"
                        variant="contained"
                        // color="primary"
                        sx={{
                          background:
                            "linear-gradient(124deg, rgb(129, 255, 228) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
                          // color: "white",
                        }}
                        disabled={revokeCurrentState === "load"}
                        startIcon={
                          revokeCurrentState === "load" ? (
                            <CircularProgress size={24} />
                          ) : null
                        }
                      >
                        {revokeCurrentState === "load"
                          ? "Revoking..."
                          : "Revoke Certificate"}
                      </SubmitButton>
                    </Box>

                    {revokeCurrentState === "validate" && (
                      <Box mt={2} textAlign="center">
                        <Alert
                          icon={<CheckCircle fontSize="inherit" />}
                          severity="success"
                          action={
                            <>
                              <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    revokeCertificateId
                                  );
                                  toast.success("Copied to clipboard!");
                                }}
                              >
                                <FileCopyOutlined />
                              </IconButton>
                              <Button
                                color="inherit"
                                size="small"
                                endIcon={<OpenInNewOutlined />}
                                onClick={() => {
                                  window.open(
                                    `${window.location.href.slice(
                                      0,
                                      -window.location.pathname.length
                                    )}/certificate/${revokeCertificateId}`
                                  );
                                }}
                              >
                                View
                              </Button>
                              <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => {
                                  setState((prev) => ({
                                    ...prev,
                                    revokeCurrentState: "normal",
                                    revokeCertificateId: "",
                                  }));
                                }}
                              >
                                <LoopOutlined />
                              </IconButton>
                            </>
                          }
                        >
                          Revoked certificate with ID: {revokeCertificateId}
                        </Alert>
                      </Box>
                    )}

                    {revokeTxnFailed && (
                      <Box mt={2}>
                        <Alert severity="error">
                          Failed to revoke certificate, please try again.
                        </Alert>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </form>
            )}
          </Box>
        </FormPaper>
      </Container>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default GenerateCert;
