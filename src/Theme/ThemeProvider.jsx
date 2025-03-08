'use client'
import { createTheme } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import React from 'react' 
const theme = createTheme({
    palette:{
        primary:{main:"#363b98"}, 
        secondary:{main:"#b09ce8"}
    }, 
    typography:{
        fontFamily: `"Open Sans", sans-serif, "Roboto", "Helvetica", "Arial"`,
        
    }
})
const ThemeProviders = ({children}) => {
  return (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
  )
}

export default ThemeProviders