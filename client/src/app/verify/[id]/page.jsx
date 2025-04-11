"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button,
  Divider,
  Link,
} from "@mui/material";
import Web3 from "web3";
import Certification from "../../../../../build/contracts/Certification.json";
import NavBar from "@/components/Navbar";

const useStyles = {
  root: {
    padding: "30px",
    minHeight: "91.5vh",
    lineHeight: "1.5",
  },
  verificationContainer: {
    padding: "24px",
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
  },
  statusIndicator: {
    padding: "16px",
    borderRadius: "8px",
    margin: "16px 0",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  detailItem: {
    margin: "16px 0",
    textAlign: "left",
  },
  detailLabel: {
    fontWeight: 500,
    color: "#363b98",
    marginBottom: "8px",
  },
  detailValue: {
    fontWeight: 600,
    color: "#3a3a3a",
  },
};

const VerifyPage = () => {
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);

  const connectWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Certification.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        Certification.abi,
        deployedNetwork && deployedNetwork.address
      );
      return { web3, contractInstance };
    } else {
      throw new Error("Please install MetaMask to verify this certificate!");
    }
  };

  const fetchCertificateData = async () => {
    try {
      setLoading(true);
      const { contractInstance } = await connectWeb3();
      const data = await contractInstance.methods.getData(id).call();

      if (!data || !data[0]) {
        setError("Certificate not found");
        return;
      }

      setCertificateData({
        candidateName: data[0],
        courseName: data[3],
        instituteName: data[6],
        revoked: data[10],
        documentUri: data[5],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateData();
  }, [id]);

  return (
    <>
      <NavBar />
      <Grid container justifyContent="center" sx={useStyles.root}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={useStyles.verificationContainer}>
            <Typography variant="h4" gutterBottom>
              Certificate Verification
            </Typography>
            <Divider sx={{ my: 2 }} />

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Typography color="error" variant="h6" sx={{ my: 2 }}>
                {error}
              </Typography>
            )}

            {!loading && certificateData && (
              <>
                <Box
                  sx={{
                    ...useStyles.statusIndicator,
                    backgroundColor: certificateData.revoked
                      ? "#ffebee"
                      : "#e8f5e9",
                    color: certificateData.revoked ? "#c62828" : "#2e7d32",
                  }}
                >
                  Status: {certificateData.revoked ? "REVOKED" : "VALID"}
                </Box>

                <Box sx={useStyles.detailItem}>
                  <Typography sx={useStyles.detailLabel}>
                    Certificate ID:
                  </Typography>
                  <Typography sx={useStyles.detailValue}>{id}</Typography>
                </Box>

                <Box sx={useStyles.detailItem}>
                  <Typography sx={useStyles.detailLabel}>
                    Student Name:
                  </Typography>
                  <Typography sx={useStyles.detailValue}>
                    {certificateData.candidateName}
                  </Typography>
                </Box>

                <Box sx={useStyles.detailItem}>
                  <Typography sx={useStyles.detailLabel}>
                    Course Name:
                  </Typography>
                  <Typography sx={useStyles.detailValue}>
                    {certificateData.courseName}
                  </Typography>
                </Box>

                <Box sx={useStyles.detailItem}>
                  <Typography sx={useStyles.detailLabel}>
                    Issuing Institute:
                  </Typography>
                  <Typography sx={useStyles.detailValue}>
                    {certificateData.instituteName}
                  </Typography>
                </Box>

                {certificateData.documentUri && (
                  <Box sx={useStyles.detailItem}>
                    <Typography sx={useStyles.detailLabel}>
                      Original Document:
                    </Typography>
                    <Link
                      href={certificateData.documentUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#363b98", textDecoration: "underline" }}
                    >
                      View Document
                    </Link>
                  </Box>
                )}

                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    This verification is powered by blockchain technology. The
                    status shown reflects the current state of the certificate
                    on the blockchain.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  //   color="primary"
                  sx={{
                    mt: 3,
                    background:
                      "linear-gradient(124deg, rgb(129, 255, 228) 0%, rgb(22, 14, 39) 36%, rgba(125,206,223,1) 100%)",
                  }}
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Home
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default VerifyPage;
