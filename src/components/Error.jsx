'use client';
import React from "react";

import { makeStyles } from "@mui/styles";
import { Paper, Box, Typography,Button } from "@mui/material";


const useStyles = makeStyles((theme) => ({
    root: { 
        display: "flex", 
        justifyContent: "center", 
        height: "100vh" 
    },
    paper: {
        textAlign: "center",
        placeSelf: "center",
        height: "fit-content",
        padding: "30px",
        margin: "30px",
        width: "100%",
        maxWidth: "600px",
    },
}));

export function Error(props) {
    const classes = useStyles();

    return (
        <>
            <Box className={classes.root}>
                <Paper className={classes.paper} elevation={3}>
                    <Typography variant="h5" color="primary">
                        {props.message}
                    </Typography>
                    {props.notFound ? (
                        <img 
                            src={"https://github.com/thawalk/Certoshi/blob/master/client/src/Images/qns_image.png?raw=true"} 
                            alt="Not Found" 
                            style={{ width: "100%" }} 
                        />
                    ) : (
                        <img 
                            src={"https://github.com/thawalk/Certoshi/blob/master/client/src/Images/error_image.png?raw=true"} 
                            alt="Error" 
                            style={{ width: "100%" }} 
                        />
                    )}
                    <Typography variant="subtitle1">
                        {props.label}
                    </Typography>
                    <Box m={3} />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => window.location.reload()}
                    >
                        {props.buttonText}
                    </Button>
                </Paper>
            </Box>
        </>
    );
}