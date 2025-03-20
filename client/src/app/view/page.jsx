"use client";

import {
  Typography,
  Paper,
  Card,
  Box,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import NavBar from "@/components/Navbar";
import { OpenInNewOutlined } from "@mui/icons-material";

const Page = () => {
  const [certId, setCertId] = useState("");

  return (
    <>
      <NavBar />
      <Box sx={{ p: 4, minHeight: "91.5vh", lineHeight: 1.5 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mt: 4,
            mb: 2,
            background:
              "linear-gradient(124deg,rgb(21, 57, 175) 0%,rgb(21, 192, 155) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          Welcome, Employee
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center">
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: "0px 0px 15px rgba(30, 90, 105, 0.4)",
              textAlign: "center",
            }}
          >
            <Card sx={{ minWidth: 250, minHeight: 70, mt: 2 }}>
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    background:
                      "linear-gradient(124deg, rgb(21, 57, 175) 0%, rgb(21, 192, 155) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: "bold",
                  }}
                >
                  View Certificate
                </Typography>
              </CardContent>
            </Card>

            <Box m={4} />
            <TextField
              id="outlined-basic"
              label="Certificate ID"
              variant="outlined"
              onChange={(e) => setCertId(e.target.value)}
              sx={{ width: 400 }}
            />
            <Box m={2} />

            {certId && (
              <Box display="flex" justifyContent="center" mb={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 2 }}
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/certificate/${certId}`
                    )
                  }
                >
                  Copy link
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<OpenInNewOutlined />}
                  onClick={() =>
                    window.open(
                      `${window.location.origin}/certificate/${certId}`
                    )
                  }
                >
                  Open Link
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Page;
