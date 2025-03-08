'use client';
import { Typography, Grid,Paper,Card, Box, CardContent, TextField, Fade, Button} from '@mui/material';
import React, { useState } from 'react'
import {makeStyles} from "@mui/styles"
import NavBar from '@/components/Navbar';
import { OpenInNewOutlined } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
    root: {
      padding: "30px",
      minHeight: "91.5vh",
      lineHeight: "1.5",
    },
    paper: {
      [theme.breakpoints.up("sm")]: {
        borderRadius: "5%",
        marginRight: 30,
      },
      [theme.breakpoints.up(1150)]: {
        marginLeft: 50,
        width: 500,
      },
      height: "100%",
      marginTop: theme.spacing.unit * 6,
      marginBottom: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
        .spacing.unit * 3}px`,
    },
  }));
const page = () => {
    const [certId, setcertId] = useState("")
    const classes = useStyles()
  return (
    <>
    <NavBar/>
   <div className={classes.root}> 
  
    <Typography variant='h4' color='primary' align='center' style={{marginTop:"30px"}}>Welcome, Employee</Typography> 
     <Typography variant='subtitle2' color='secoundary' align='center' style={{marginTop:'30px', marginBottom:"30px"}}> 
     You may key in the certificate id to view the Verified Certificate
     created on the Credentials Ethereum Blockchain

     </Typography>
     
     <Grid container style={{
        height:"100%", 
        justifyContent:'center', 
        alignItems:'center'
     }} 
     direction={'column'} 
     align
     > 
      <Paper className={classes.paper} style={{borderRadius:"10px"}}>
        <Card style={{border:"1px solid #363b98",minWidth:"250px",minHeight:"70px", marginTop:"10px"}}>
             <CardContent style={{textAlign:"center", alignItems:"center", justifyContent:'center'}}>
                <Typography variant='h5' color='primary'>
                     View Cerificate
                </Typography>
             </CardContent>
        </Card>
        <Box m={4}/>
        <TextField  
          id='outlined-basic' 
          label="Certificate ID"  
          variant='outlined' 
          onChange={(e)=>{
            setcertId(e.target.value)
          }}
          style={{width:"400px"}}
        />
      <Box m={2}/> 
      {certId &&(
        <Box display={'flex'} style={{marginBottom:"10px"}} >
          <Button variant="outlined" color="primary" className={classes.button}  
            onClick={()=>{
                navigator.clipboard.writeText(
                    `${window.location.href.slice(0, -window.location.pathname.length)}/certificate/${certId}`
                )
            }}
            style={{marginRight:"10px"}}
          > 
            Copy link

          </Button>
          <Button variant="outlined" color="primary" className={classes.button} endIcon={<OpenInNewOutlined/>} 
            onClick={()=>{
                window.open(
                    `${window.location.href.slice(0, -window.location.pathname.length)}/certificate/${certId}`
                )
            }}
        
          > 
            open Link

          </Button>

        </Box>
      )}

      </Paper>

     </Grid>
   </div> 
   </>
  )
}

export default page