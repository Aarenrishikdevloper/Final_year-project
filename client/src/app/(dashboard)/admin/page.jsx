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
import React, { useState } from "react";
import { Error } from "@/components/Error"; // Ensure this path is correct
import Lock from "@mui/icons-material/Lock";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import NavBar from "@/components/Navbar";
import { Delete, DeleteOutlined } from "@mui/icons-material";

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
  const [renderadmin, setRenderAdmin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rendermetamaskError, setRenderMetamaskError] = useState(false);
  const [networkerror, setNetworkError] = useState(false);
  const [open, setopen] = useState(false);
  const classes = useStyles();
  const onClose = () => {
    setopen(false);
  };
  return (
    <>
      {!loading && <NavBar />}
      {loading ? (
        <p>Connecting</p>
      ) : rendermetamaskError ? (
        <Error
          message="You are not using an Ethereum-based browser"
          label="You could download Metamask on this browser or use another Ethereum-based browser"
          buttonText="Done"
        />
      ) : renderadmin ? (
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
            Welcome, Central Authority
          </Typography>
        </>
      ) : (
        <>
          {!networkerror && (
            <Error
              message="You are not connected to a valid central authority account"
              label="Please try again once you have connected to the right account"
              buttonText="Done"
            />
          )}
          {networkerror && (
            <Error
              message="You are not connected to an Ethereum network"
              label="Please try again once you have connected to an Ethereum network"
              buttonText="Done"
            />
          )}
        </>
      )}
      {renderadmin && (
        <div>
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
                    Insitute Account Adresss
                  </InputLabel>
                  <Input
                    id="address"
                    label="Institute Account Adresss"
                    type="name"
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
                    label="Institute Accornym"
                    type="name"
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
                  <IconButton color="primary" onClick={() => setopen(true)}>
                    <AddCircleOutline />
                  </IconButton>
                </Box>
                <Dialog
                  open={open}
                  onClose={onClose}
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
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button color="primary" variant="contained">
                      Submit
                    </Button>
                  </DialogActions>
                </Dialog>
                <>
                  <Box
                    display={"flex"}
                    justifyContent={"center"}
                    className={classes.courseItem}
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                  >
                    <Typography style={{ alignSelf: "center" }}>
                      Course 1
                    </Typography>
                    <IconButton color="primary">
                      <Delete Button="true" />
                    </IconButton>
                  </Box>
                </>
                <Dialog></Dialog>
                <Button
                  onClick={() => {}}
                  fullWidth
                  variant="outlined"
                  color="primary"
                  className={classes.submit}
                >
                  Autofill
                </Button>
                <Box m={1.5} />
                <Button
                  onClick={() => {}}
                  type="submit"
                  fullWidth
                  variant="contained"
                  style={{
                    background:
                      "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
                  }}
                  className={classes.submit}
                >
                  Add Institute
                </Button>
                <Box m={2} />
              </form>
            </Paper>
          </Grid>
        </div>
      )}
    </>
  );
};

export default Page;
