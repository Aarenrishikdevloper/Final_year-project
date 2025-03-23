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
  Input,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState, useEffect } from "react";
import { Error } from "@/components/Error"; // Ensure this path is correct
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import NavBar from "@/components/Navbar";
import { Delete } from "@mui/icons-material";
import toast from "react-hot-toast";

// Blockchain setup
import Web3 from "web3";
import InstitutionABI from "../../../../../build/contracts/Institution.json";

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
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
    width: "95%",
    marginLeft: "10px",
    marginRight: "10px",
  },
  courseItem: {
    width: "95%",
    background: "#73737312",
    borderRadius: "100px",
    marginBottom: "10px",
    paddingLeft: "25px",
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

  // Check if the selected account matches the expected address
  const checkSelectedAccount = async (expectedAddress) => {
    const accounts = await web3.eth.getAccounts();
    const selectedAccount = accounts[0]; // Currently selected account in MetaMask

    if (selectedAccount.toLowerCase() !== expectedAddress.toLowerCase()) {
      toast.error(
        `Please switch to the correct account (${expectedAddress}) in MetaMask to proceed.`
      );
      return false;
    }
    return true;
  };

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
        if (accounts.length === 0) {
          setError("No accounts connected. Please connect your wallet.");
          setLoading(false);
          return;
        }
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
          deployedNetwork.address
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
  const handleAddInstitute = async (event) => {
    event.preventDefault();
    if (!web3 || !contract) {
      toast.error("Web3 not initialized. Check your connection.");
      return;
    }

    // Basic form validation
    if (
      !instituteAddress ||
      !instituteName ||
      !instituteAcronym ||
      !instituteWebsite ||
      courses.length === 0
    ) {
      toast.error("Please fill out all fields and add at least one course.");
      return;
    }

    try {
      setLoading(true);

      // Check if the correct account is selected
      const isCorrectAccount = await checkSelectedAccount(account);
      if (!isCorrectAccount) {
        setLoading(false);
        return;
      }

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

      toast.success("Institute added successfully!");
      setInstituteName("");
      setInstituteAddress("");
      setInstituteAcronym("");
      setInstituteWebsite("");
      setCourses([]);
    } catch (error) {
      console.error("Error adding institute:", error);

      // Parse and display smart contract errors
      if (error.code === 4001) {
        toast.error("Transaction rejected by the user.");
      } else if (error.message.includes("revert")) {
        // Extract the error message from the revert reason
        const revertReason =
          error.message.match(/revert\s+(.*)/)?.[1] || "Transaction failed.";
        toast.error(`Transaction failed: ${revertReason}`);
      } else {
        toast.error("Failed to add institute. Check console for errors.");
      }
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

          <Grid container style={{ height: "100%", justifyContent: "center" }}>
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
                    Institute Account Address
                  </InputLabel>
                  <Input
                    id="address"
                    label="Institute Account Address"
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
                  <InputLabel htmlFor="address">Institute Acronym</InputLabel>
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
                    label="Institute Website"
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
                    Add an Institute Course
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      After adding this course, this course will be one of the
                      choices of courses available for selection in certificate
                      generation.
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

                <Box m={1.5} />
                <Button
                  onClick={handleAddInstitute}
                  // type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  style={{
                    background:
                      "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
                    WebkitBorderBottomLeftRadius: "25px",
                    WebkitBorderBottomRightRadius: "25px",
                  }}
                  className={classes.submit}
                >
                  {loading ? <CircularProgress size={24} /> : "Add Institute"}
                </Button>
                <Box m={2} />
              </form>
            </Paper>
          </Grid>
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
