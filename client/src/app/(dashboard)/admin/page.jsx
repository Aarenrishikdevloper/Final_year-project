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
  Alert,
  Container,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState, useEffect } from "react";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import NavBar from "@/components/Navbar";
import { Delete } from "@mui/icons-material";
import toast from "react-hot-toast";

// Blockchain setup
import Web3 from "web3";
import InstitutionABI from "../../../../../build/contracts/Institution.json";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(2, "auto"),
  padding: theme.spacing(4),
  maxWidth: 800,
  [theme.breakpoints.up("sm")]: {
    borderRadius: theme.shape.borderRadius * 2,
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background:
    "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
  margin: theme.spacing(4, 0, 2),
  textAlign: "center",
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background:
    "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(3),
}));

const CourseItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius * 3,
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(3),
  border: `1px solid ${theme.palette.grey[300]}`,
}));

const Page = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instituteAddress, setInstituteAddress] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [instituteAcronym, setInstituteAcronym] = useState("");
  const [instituteWebsite, setInstituteWebsite] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const checkSelectedAccount = async (expectedAddress) => {
    const accounts = await web3.eth.getAccounts();
    const selectedAccount = accounts[0];
    if (selectedAccount.toLowerCase() !== expectedAddress.toLowerCase()) {
      toast.error(
        `Please switch to the correct account (${expectedAddress}) in MetaMask to proceed.`
      );
      return false;
    }
    return true;
  };

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

  const handleAddInstitute = async (event) => {
    event.preventDefault();
    if (!web3 || !contract) {
      toast.error("Web3 not initialized. Check your connection.");
      return;
    }

    if (
      !instituteAddress ||
      !instituteName ||
      !instituteAcronym ||
      !instituteWebsite ||
      !governmentId ||
      courses.length === 0
    ) {
      toast.error("Please fill out all fields and add at least one course.");
      return;
    }

    try {
      setLoading(true);
      const isCorrectAccount = await checkSelectedAccount(account);
      if (!isCorrectAccount) {
        setLoading(false);
        return;
      }

      const formattedCourses = courses.map((course) => ({
        course_name: course,
      }));

      await contract.methods
        .addInstitute(
          instituteAddress,
          instituteName,
          instituteAcronym,
          instituteWebsite,
          governmentId,
          formattedCourses
        )
        .send({ from: account });

      toast.success("Institute added successfully!");
      setInstituteName("");
      setInstituteAddress("");
      setInstituteAcronym("");
      setInstituteWebsite("");
      setGovernmentId("");
      setCourses([]);
    } catch (error) {
      console.error("Error adding institute:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by the user.");
      } else if (error.message.includes("revert")) {
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

  if (loading) {
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

  if (error) {
    return (
      <>
        <NavBar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You could download Metamask on this browser or use another
              Ethereum-based browser
            </Typography>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => window.location.reload()}
          >
            Done
          </Button>
        </Container>
      </>
    );
  }

  if (!isAdmin) {
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
              <Delete fontSize="large" />
            </Avatar>
            <Typography variant="h4" color="error" gutterBottom>
              Unauthorized Access
            </Typography>
            <Typography variant="body1" paragraph>
              Only the contract owner can register institutes.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please connect with the administrator account to access this page.
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
        <GradientText variant="h4">Welcome, Blockchain Admin</GradientText>

        <StyledPaper elevation={3}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="primary">
                Institute Registration
              </Typography>
            </CardContent>
          </Card>

          <Box component="form" onSubmit={handleAddInstitute}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute Account Address"
                  value={instituteAddress}
                  onChange={(e) => setInstituteAddress(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute Name"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute Acronym"
                  value={instituteAcronym}
                  onChange={(e) => setInstituteAcronym(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute Website Link"
                  value={instituteWebsite}
                  onChange={(e) => setInstituteWebsite(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Institute Government ID"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Courses</Typography>
              <Button
                startIcon={<AddCircleOutline />}
                onClick={() => setOpen(true)}
                variant="outlined"
              >
                Add Course
              </Button>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>Add an Institute Course</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  After adding this course, it will be available for selection
                  in certificate generation.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Course name"
                  fullWidth
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    if (courseName.trim() !== "") {
                      setCourses([...courses, courseName]);
                      setCourseName("");
                      setOpen(false);
                    }
                  }}
                  variant="contained"
                >
                  Submit
                </Button>
              </DialogActions>
            </Dialog>

            <List sx={{ mt: 2 }}>
              {courses.map((course, index) => (
                <React.Fragment key={index}>
                  <CourseItem>
                    <ListItemText primary={course} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setCourses(courses.filter((_, i) => i !== index))
                        }
                      >
                        <Delete color="error" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </CourseItem>
                  {index < courses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Adding Institute...
                </>
              ) : (
                "Add Institute"
              )}
            </SubmitButton>
          </Box>
        </StyledPaper>
      </Container>
    </>
  );
};

export default Page;
