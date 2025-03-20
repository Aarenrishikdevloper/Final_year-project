"use client";
import React, { useEffect, useState } from "react";
import Institution from "../../../contracts/Institution.json";
import Certification from "../../../contracts/Certification.json";
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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  OpenInNewOutlined,
  FileCopyOutlined,
  LoopOutlined,
} from "@mui/icons-material";
import { encrypt } from "../../../utils/encrypt.js";
// import { useRouter } from "next/router";
import NavBar from "@/components/Navbar";
// import Button from "@/components/SubmitApplication";

// Styled Components
const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: "#b09ce8",
    height: "3px",
  },
});

const StyledTab = styled(Tab)(({ theme }) => ({
  color: "white",
  opacity: 1,
  fontSize: "20px",
  padding: "10px",
  "&.Mui-selected": {
    opacity: 1,
  },
}));

// Styles
const useStyles = {
  appbar: {
    background:
      "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
  },
  tabPanel: {
    height: "100%",
    overflowY: "scroll",
    marginBottom: "2vh",
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: "8px",
    minWidth: 520,
  },
  textField: {
    marginLeft: "8px",
    marginRight: "8px",
    width: 250,
    "@media (max-width: 600px)": {
      width: 200,
    },
  },
  instituteField: {
    marginLeft: "8px",
    marginRight: "8px",
    width: 520,
    "@media (max-width: 600px)": {
      width: 200,
    },
  },
  paper: {
    minHeight: "75vh",
    maxWidth: "95%",
    margin: "40px",
    display: "flex",
    flexDirection: "column",
    padding: "32px 64px 24px",
    marginTop: "20px",
    "@media (max-width: 600px)": {
      margin: "8px",
      padding: "16px",
    },
  },
  rightpaper: {
    maxWidth: "60%",
    minWidth: "60%",
    margin: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 24px 24px",
    "@media (max-width: 600px)": {
      maxWidth: "95%",
      margin: "16px",
    },
  },
  verificationBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyItems: "center",
    height: "100%",
    marginTop: "24px",
  },
  courseField: {
    width: "60%",
    "@media (max-width: 600px)": {
      minWidth: "80vw",
    },
  },
  submitBtn: {
    marginLeft: "50px",
  },
};

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
        "❕ Non-Ethereum browser detected. You should consider trying MetaMask!"
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
        "❕ Please make sure you are connected to the correct network"
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
        "❕ Please make sure you are connected to the correct network"
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
      const formattedInstituteCoursesData = res[3].map((x) => ({
        course_name: x.course_name,
      }));

      setState((prev) => ({
        ...prev,
        instituteName: res[0],
        instituteAcronym: res[1],
        instituteWebsite: res[2],
        instituteCourses: formattedInstituteCoursesData,
        isLegitInstitute: true,
        renderLoading: false,
      }));
    } catch (error) {
      toast.warning("❕ You are not authorized to access this page");
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

  const submitData = async (event) => {
    event.preventDefault();
    if (state.currentState === "validate") return;

    setState((prev) => ({ ...prev, currentState: "load" }));

    const { firstname, lastname, courseIndex } = state;
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
        .generateCertificate(candidateName, courseIndex, encryptedDate)
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
        toast.success("✅ Successfully generated certificate!");
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
          "❌ Transaction failed. Please check that you have set enough gas limit."
        );
      } else if (error.code === 4001) {
        toast.error("❌ Transaction rejected!");
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
      await certification.methods
        .revokeCertificate(revokeCertificateId)
        .send({ from: caller, gas: 2100000 });

      toast.success("✅ Successfully revoked certificate!");
      setState((prev) => ({
        ...prev,
        revokeCurrentState: "validate",
        revokeTxnFailed: false,
      }));
    } catch (error) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        revokeCurrentState: "normal",
        revokeTxnFailed: true,
      }));

      if (error.code === -32603) {
        toast.error(
          "❌ Revocation Transaction failed. Please check that certificate id exists and you have set enough gas limit."
        );
      } else if (error.code === 4001) {
        toast.error("❌ Revocation Transaction rejected!");
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
    instituteCourses,
    isLegitInstitute,
    firstname,
    lastname,
    certificateId,
    currentState,
    txnFailed,
    tabValue,
    revokeCertificateId,
    revokeCurrentState,
    revokeTxnFailed,
  } = state;

  if (renderLoading) return <div>Connecting...</div>;
  if (renderMetaMaskError)
    return (
      <div>
        You are not using an Ethereum-based browser. Please install MetaMask.
      </div>
    );
  if (networkError)
    return <div>Please connect to the correct Ethereum network.</div>;
  if (isLegitInstitute === false)
    return <div>You are not authorized to access this page.</div>;

  return (
    <>
      <NavBar />
      <Grid
        container
        align="center"
        justifyContent={"center"}
        alignItems="center"
      >
        <Grid item xs={8} sm={8}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              background:
                "linear-gradient(124deg, rgb(13, 37, 117) 0%, rgb(21, 192, 155) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
              marginTop: "30px",
            }}
          >
            Welcome, Institute
          </Typography>
          <Paper sx={useStyles.paper}>
            <AppBar position="static" sx={useStyles.appbar}>
              <StyledTabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="simple tabs example"
                variant="fullWidth"
              >
                <StyledTab label="Generate Certificate" />
                <StyledTab label="Revoke Certificate" />
              </StyledTabs>
            </AppBar>
            <div style={useStyles.tabPanel}>
              {tabValue === 0 && (
                <form
                  style={{ ...useStyles.container, marginTop: "3vh" }}
                  autoComplete="off"
                  onSubmit={submitData}
                >
                  <Grid item xs={12} sm={12}>
                    <Typography variant="subtitle1">
                      Input the certificate details below to generate a
                      certificate
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      disabled
                      id="institute-name"
                      label="Institute Name"
                      sx={useStyles.instituteField}
                      value={instituteName}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      required
                      disabled
                      id="institute-acronym"
                      label="Institute Acronym"
                      sx={useStyles.instituteField}
                      value={instituteAcronym}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      required
                      disabled
                      id="institute-website"
                      label="Institute Website"
                      sx={useStyles.instituteField}
                      value={instituteWebsite}
                      margin="normal"
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      id="firstname"
                      label="First Name"
                      sx={useStyles.textField}
                      value={firstname}
                      onChange={handleChange("firstname")}
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      required
                      id="lastname"
                      label="Last Name"
                      sx={useStyles.textField}
                      value={lastname}
                      onChange={handleChange("lastname")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <FormControl
                      required
                      variant="outlined"
                      sx={useStyles.formControl}
                    >
                      <InputLabel htmlFor="course-index">Course</InputLabel>
                      <Select
                        native
                        value={state.courseIndex}
                        onChange={handleChange("courseIndex")}
                        label="Courses"
                      >
                        {instituteCourses.map((course, index) => (
                          <option value={index} key={index}>
                            {course.course_name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Button
                        type="submit"
                        // variant="contained"
                        // color="primary"
                        // className={`animatedButton ${
                        //   currentState === "load" ? "load" : ""
                        // }`}
                        sx={useStyles.submitBtn}
                        disabled={currentState === "load"}
                        // currentState={currentState}
                      >
                        {currentState === "load" ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Generate Certificate"
                        )}
                      </Button>
                      {currentState === "validate" && (
                        <IconButton
                          style={{ marginTop: "16px" }}
                          color="primary"
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
                      )}
                    </Box>
                    {currentState === "validate" && (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="inherit"
                          sx={useStyles.submitBtn}
                          style={{ marginRight: "10px" }}
                        >
                          Certificate generated with id {certificateId}
                        </Typography>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(certificateId);
                          }}
                        >
                          <FileCopyOutlined />
                        </IconButton>
                        <Button
                          variant="outlined"
                          color="primary"
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
                          Open
                        </Button>
                      </Box>
                    )}
                    {txnFailed && (
                      <div>
                        Failed to generate certificate, please try again.
                      </div>
                    )}
                  </Grid>
                </form>
              )}
              {tabValue === 1 && (
                <form
                  style={{ ...useStyles.container, marginTop: "3vh" }}
                  autoComplete="off"
                  onSubmit={revokeCertificateFunction}
                >
                  <Grid item xs={12} sm={12}>
                    <Typography variant="subtitle1">
                      Input the id of the certificate you want to revoke
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      id="revoke_certificate_id"
                      label="Certificate ID"
                      sx={useStyles.instituteField}
                      value={revokeCertificateId}
                      onChange={handleChange("revokeCertificateId")}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Button
                        type="submit"
                        // variant="contained"
                        // color="primary"
                        sx={useStyles.submitBtn}
                        disabled={revokeCurrentState === "load"}
                        currentState={revokeCurrentState}
                      >
                        {revokeCurrentState === "load" ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Revoke Certificate"
                        )}
                      </Button>
                      {revokeCurrentState === "validate" && (
                        <IconButton
                          style={{ marginTop: "16px" }}
                          color="primary"
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
                      )}
                    </Box>
                    {revokeCurrentState === "validate" && (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="inherit"
                          sx={useStyles.submitBtn}
                          style={{ marginRight: "10px" }}
                        >
                          Revoked Certificate with id {revokeCertificateId}
                        </Typography>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(revokeCertificateId);
                          }}
                        >
                          <FileCopyOutlined />
                        </IconButton>
                        <Button
                          variant="outlined"
                          color="primary"
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
                          Open
                        </Button>
                      </Box>
                    )}
                    {revokeTxnFailed && (
                      <div>Failed to revoke certificate, please try again.</div>
                    )}
                  </Grid>
                </form>
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>
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
