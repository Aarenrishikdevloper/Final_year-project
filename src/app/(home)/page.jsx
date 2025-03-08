"use client";
import { Box, Button, Grid, Grid2, Stack, Typography, useMediaQuery } from "@mui/material";

import Image from 'next/image'
import {makeStyles, useTheme} from "@mui/styles"
import{theme} from "@/Theme/ThemeProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 64px)",
    background: "linear-gradient(124deg, rgba(116,65,249,1) 0%, rgba(145,99,252,1) 36%, rgba(125,206,223,1) 100%)",
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
  const classes = useStyles()
  const theme = useTheme(); 
  const md = useMediaQuery(theme.breakpoints.up("md")); 
  const router = useRouter()
 const navigate =(path)=>{ 
   router.push(path);
   
 }
  return (
   <> 
    <Navbar/>
    <Grid2 container className={classes.root}>
      <Box className={classes.leftPanel}>
        <Typography variant="h4" fontWeight={100}>
          Verifiable Certification
        </Typography>
        <Typography variant="h2" fontWeight={900} mt={1}>
          Certoshi
        </Typography>
        <Typography variant="body2" mt={2}>
          A Decentralized Certificate Issuance and Verification System to create certificates that are Immutable, Cryptographically Secured, and have Zero Downtime. All powered by decentralized Ethereum Smart Contracts.
        </Typography>
        <Typography variant="h6" mt={3}>
          What are you looking for?
        </Typography>
        <Box mt={2} display="flex">
          <Button variant="contained" color="primary" size="large" sx={{ mr: 3, fontWeight: 500 }} onClick={() => navigate("/institute")}>
            Issue Certificates
          </Button>
          <Button variant="contained" size="large" sx={{ backgroundColor: "white", fontWeight: 500, color: "black" }} onClick={() => navigate("/view")}>
            View Certificate
          </Button>
        </Box>
      </Box>

      {md && (
        <Box className={classes.imageContainer}>
          <Image src="https://github.com/thawalk/Certoshi/blob/master/client/src/Images/blockchain_credentials.png?raw=true"  width={1000} height={1000} className={classes.image} alt="Blockchain Credentials" />
        </Box>
      )}
    </Grid2>
     
     
    </>
    )  
}
