"use client";
import {
  Box,
  Button,
  Grid,
  Grid2,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import Image from "next/image";
import { makeStyles, useTheme } from "@mui/styles";
import { theme } from "@/Theme/ThemeProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 64px)",
    background:
      "linear-gradient(124deg, rgb(65, 249, 209) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10vw",
    overflow: "hidden",
  },
  leftPanel: {
    color: "white",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  image: {
    maxWidth: "100%",
    height: "auto",
  },
}));

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const router = useRouter();
  const navigate = (path) => {
    router.push(path);
  };
  return (
    <>
      <Navbar />
      <Grid2 container className={classes.root}>
        <Box className={classes.leftPanel}>
          <Typography variant="h2" fontWeight={900} mt={1}>
            Secure and Immutable System for Storing and Retrieving Educational
            Certificates Using Blockchain
          </Typography>
          <Typography variant="body2" mt={2}>
            A Decentralized Certificate Issuance and Verification System to
            create certificates that are Immutable, Cryptographically Secured,
            and have Zero Downtime. All powered by decentralized Ethereum Smart
            Contracts.
          </Typography>
          <Box
            mt={2}
            display="flex"
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ mr: 3, fontWeight: 500 }}
              onClick={() => navigate("/institute")}
            >
              Issue Certificates
            </Button>
            <Button
              variant="contained"
              size="large"
              sx={{ backgroundColor: "white", fontWeight: 500, color: "black" }}
              onClick={() => navigate("/view")}
            >
              View Certificate
            </Button>
          </Box>
        </Box>
      </Grid2>
    </>
  );
}
