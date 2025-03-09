"use client";
import React, { useState } from "react";
import {
  TextField,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Tab,
  Tabs,
  Button,
  Box,
  IconButton,
  styled,
} from "@mui/material";
import {
  OpenInNewOutlined,
  FileCopyOutlined,
  LoopOutlined,
} from "@mui/icons-material";
import { Error } from "@/components/Error";
import SubmitAnimation from "@/components/SubmitApplication";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "@/components/Navbar";
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
}
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
    instituteName: "Sample Institute",
    instituteAcronym: "SI",
    instituteWebsite: "https://sampleinstitute.com",
    instituteCourses: [
      { course_name: "Course 1" },
      { course_name: "Course 2" },
      { course_name: "Course 3" },
    ],
    firstname: "",
    lastname: "",
    selectedCourse: null,
    currentState: "normal",
    certificateId: "",
    courseIndex: 0,
    tabValue: 0,
    revokeCertificateId: "",
    revokeCurrentState: "normal",
  });

  const handleChange = (name) => (event) => {
    setState((prev) => ({
      ...prev,
      [name]: event.target.value,
      currentState: "normal",
      revokeCurrentState: "normal",
    }));
  };

  const handleTabChange = (event, newValue) => {
    setState((prev) => ({ ...prev, tabValue: newValue }));
  };

  const submitData = async (event) => {
    event.preventDefault();
    if (state.currentState === "validate") return;

    setState((prev) => ({ ...prev, currentState: "load" }));

    const { firstname, lastname, courseIndex } = state;
    const candidateName = `${firstname} ${lastname}`;
    const certId = uuidv4();

    // Simulate a delay for submission
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        currentState: "validate",
        certificateId: certId,
      }));
      toast.success("✅ Certificate generated successfully!");
    }, 2000);
  };

  const revokeCertificateFunction = async (event) => {
    event.preventDefault();
    if (state.revokeCurrentState === "validate") return;

    setState((prev) => ({ ...prev, revokeCurrentState: "load" }));

    // Simulate a delay for revocation
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        revokeCurrentState: "validate",
      }));
      toast.success("✅ Certificate revoked successfully!");
    }, 2000);
  };

  const {
    instituteName,
    instituteAcronym,
    instituteWebsite,
    instituteCourses,
    firstname,
    lastname,
    certificateId,
    currentState,
    tabValue,
    revokeCertificateId,
    revokeCurrentState,
  } = state;

  return (
    <>
      <NavBar />
      <Grid container align="center" justifyContent={"center"}>
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
              <TabPanel value={tabValue} index={0}>
                <form
                  style={{ ...useStyles.container, marginTop: "3vh" }}
                  autoComplete="off"
                  onSubmit={submitData}
                >
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
                  <Grid item xs={12} sm={12} justifyContent>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <SubmitAnimation
                        currentState={currentState}
                        className={useStyles.submitBtn}
                      />
                      {currentState === "validate" && (
                        <IconButton
                          style={{ marginTop: "10px" }}
                          color="primary"
                          onClick={() => {
                            setState({
                              currentState: "normal",
                              firstname: "",
                              lastname: "",
                            });
                          }}
                        />
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
                  </Grid>
                </form>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <form
                  style={{ ...useStyles.container, marginTop: "3vh" }}
                  autoComplete="off"
                  onSubmit={revokeCertificateFunction}
                >
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      id="revoke_certificate_id"
                      label="Certificate ID"
                      sx={useStyles.instituteField}
                      value={revokeCertificateId}
                      margin="normal"
                      variant="outlined"
                      onChange={handleChange("revokeCertificateId")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <SubmitAnimation
                        currentState={revokeCurrentState}
                        sx={useStyles.submitBtn}
                      />
                      {revokeCurrentState === "validate" && (
                        <IconButton
                          style={{ marginTop: "16px" }}
                          color="primary"
                          variant="contained"
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
                  </Grid>
                </form>
              </TabPanel>
            </div>
          </Paper>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default GenerateCert;
