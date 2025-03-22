"use client";
import {
  Card,
  CardContent,
  Grid,
  Paper,
  TextField,
  Typography,
  Box,
  IconButton,
  FormControl,
  FormControlLabel,
  Checkbox,
  Input,
  InputLabel,
  Button,
  Grid2,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState, useEffect } from "react";
import { Error } from "@/components/Error"; // Ensure this path is correct
import Lock from "@mui/icons-material/Lock";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import NavBar from "@/components/Navbar";
import { Delete, DeleteOutlined } from "@mui/icons-material";

// Blockchain setup
import Web3 from "web3";
import InstitutionABI from "../../../contracts/Institution.json";

const INSTITUTION_CONTRACT_ADDRESS =
  "0xE704F2B35238Fdc54bD7D0Fa8D8F6255b5f50E0d";

// Replace makeStyles with styled
const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
  },
  paper: {
    [theme.breakpoints.up("sm")]: {
      borderRadius: "5%",
      marginRight: 30,
    },
    [theme.breakpoints.up(1150)]: {
      marginLeft: 50,
      width: 700,
    },
    height: "100%",
    marginTop: theme.spacing.unit * 6,
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${
      theme.spacing.unit * 3
    }px`,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    // marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
    width: "95%",
    marginLeft: "10px",
    marginRight: "10px",
  },
  media: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${
      theme.spacing.unit * 3
    }px`,
  },
  imgstyles: {
    maxWidth: "70vw",
    maxHeight: "90vh",
    [theme.breakpoints.down(1200)]: {
      marginTop: theme.spacing.unit * 4,
    },
  },
  courseItem: {
    width: "95%",
    background: "#73737312",
    borderRadius: "100px",
    marginBottom: "10px",
    paddingLeft: "25px",
    marginBottom: "10px",
    border: "1px solid #d8d8d8",
  },
}));

const Page = () => {
  const classes = useStyles();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instituteAddress, setInstituteAddress] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [instituteAcronym, setInstituteAcronym] = useState("");
  const [instituteWebsite, setInstituteWebsite] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]); // Store list of courses
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  // Initialize blockchain connection
  useEffect(() => {
    async function connectBlockchain() {
      try {
        if (!window.ethereum) {
          setError("MetaMask not detected! Please install it.");
          setLoading(false);
          return;
        }

        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = InstitutionABI.networks[networkId];

        if (!deployedNetwork) {
          setError("Wrong network! Connect to the correct Ethereum network.");
          setLoading(false);
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          InstitutionABI.abi,
          INSTITUTION_CONTRACT_ADDRESS
        );

        // Check if the connected account is the contract owner
        const owner = await contractInstance.methods.owner().call();
        setIsAdmin(accounts[0] === owner);
        setContract(contractInstance);
        setWeb3(web3Instance);
      } catch (err) {
        setError("Failed to connect to blockchain!");
      } finally {
        setLoading(false);
      }
    }
    connectBlockchain();
  }, []);

  // Add Institute to Blockchain
  const handleAddInstitute = async () => {
    if (!web3 || !contract) {
      alert("Web3 not initialized. Check your connection.");
      return;
    }

    try {
      setLoading(true);
      const formattedCourses = courses.map((course) => ({
        course_name: course,
      }));

      console.log("Sending Transaction:", {
        instituteAddress,
        instituteName,
        instituteAcronym,
        instituteWebsite,
        formattedCourses,
      });

      await contract.methods
        .addInstitute(
          instituteAddress,
          instituteName,
          instituteAcronym,
          instituteWebsite,
          formattedCourses
        )
        .send({ from: account });

      alert("Institute added successfully!");
      setInstituteName("");
      setInstituteAddress("");
      setInstituteAcronym("");
      setInstituteWebsite("");
      setCourses([]);
    } catch (error) {
      console.error("Error adding institute:", error);
      alert("Failed to add institute. Check console for errors.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {!loading && <NavBar />}
      {loading ? (
        <p>Connecting to Blockchain...</p>
      ) : error ? (
        <Error
          message={error}
          label="You could download Metamask on this browser or use another Ethereum-based browser"
          buttonText="Done"
        />
      ) : isAdmin ? (
        <>
          <Typography
            variant="h4"
            color="primary"
            align="center"
            style={{
              marginTop: "30px",
              marginBottom: "30px",
              background:
                "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            Welcome, Blockchain Admin
          </Typography>

          <Grid2 container style={{ height: "100%", justifyContent: "center" }}>
            <Paper className={classes.paper}>
              <Card
                style={{
                  minWidth: "250px",
                  minHeight: "70px",
                  marginTop: "10px",
                }}
              >
                <CardContent
                  style={{
                    textAlign: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h5" color="rgb(19, 15, 77)">
                    Institute Registration
                  </Typography>
                </CardContent>
              </Card>
              <Box m={1} />

              <form className={classes.form}>
                <FormControl
                  margin="normal"
                  style={{
                    width: "95%",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                >
                  <InputLabel htmlFor="address">
                    Insitute Account Adresss
                  </InputLabel>
                  <Input
                    id="address"
                    label="Institute Account Adresss"
                    type="name"
                    value={instituteAddress}
                    onChange={(e) => setInstituteAddress(e.target.value)}
                    autoFocus
                  />
                </FormControl>
                <FormControl
                  margin="normal"
                  style={{
                    width: "95%",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                >
                  <InputLabel htmlFor="address">Institute Name</InputLabel>
                  <Input
                    id="address"
                    label="Institute Name"
                    type="name"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    autoFocus
                  />
                </FormControl>

                <FormControl
                  margin="normal"
                  style={{
                    width: "95%",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                >
                  <InputLabel htmlFor="address">Institute Accronym</InputLabel>
                  <Input
                    id="address"
                    label="Institute Acronym"
                    type="name"
                    value={instituteAcronym}
                    onChange={(e) => setInstituteAcronym(e.target.value)}
                    autoFocus
                  />
                </FormControl>
                <FormControl
                  margin="normal"
                  style={{
                    width: "95%",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                >
                  <InputLabel htmlFor="address">
                    Institute Website Link
                  </InputLabel>
                  <Input
                    id="address"
                    label="Institute Websites"
                    type="name"
                    value={instituteWebsite}
                    onChange={(e) => setInstituteWebsite(e.target.value)}
                    autoFocus
                  />
                </FormControl>
                <Box m={3} />
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignContent={"center"}
                >
                  <Typography
                    variant="h6"
                    style={{
                      alignSelf: "flex-start",
                      marginBottom: "-10px",
                      marginLeft: "10px",
                    }}
                  >
                    Courses
                  </Typography>
                  <IconButton color="primary" onClick={() => setOpen(true)}>
                    <AddCircleOutline />
                  </IconButton>
                </Box>

                {/* Add courses DialogBox */}
                <Dialog
                  open={open}
                  onClose={() => setOpen(false)}
                  aria-label="form-dialog-title"
                >
                  <DialogTitle id="from-dialog-title">
                    Add an Institue Course
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      After adding this course, this course will be one of the
                      choices of courses avalaible for selection in certificate
                      generation
                    </DialogContentText>

                    <TextField
                      id="address"
                      label="Course name"
                      type="name"
                      autoFocus
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      style={{
                        width: "95%",
                        marginLeft: "10px",
                        marginRight: "10px",
                        marginTop: "20px",
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        if (courseName.trim() !== "") {
                          setCourses([...courses, courseName]); // Add course to list
                          setCourseName(""); // Clear input field
                          setOpen(false);
                        }
                      }}
                    >
                      Submit
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Display Courses */}
                {courses.map((course, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    className={classes.courseItem}
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                  >
                    <Typography>{course}</Typography>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        setCourses(courses.filter((_, i) => i !== index))
                      }
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}

                <Dialog></Dialog>
                {/* <Button
                  onClick={() => {}}
                  fullWidth
                  variant="outlined"
                  color="primary"
                  className={classes.submit}
                >
                  Autofill
                </Button> */}
                <Box m={1.5} />
                <Button
                  onClick={handleAddInstitute}
                  type="submit"
                  fullWidth
                  variant="contained"
                  style={{
                    background:
                      "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
                    WebkitBorderBottomLeftRadius: "25px",
                    WebkitBorderBottomRightRadius: "25px",
                  }}
                  className={classes.submit}
                >
                  Add Institute
                </Button>
                <Box m={2} />
              </form>
            </Paper>
          </Grid2>
        </>
      ) : (
        <Error
          message="Unauthorized"
          label="Only the contract owner can register institutes."
          buttonText="OK"
        />
      )}
    </>
  );
};

export default Page;
