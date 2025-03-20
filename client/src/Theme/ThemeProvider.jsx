"use client";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import React from "react";

const cache = createCache({ key: "mui", prepend: true }); // Ensures consistent class names
const theme = createTheme({
  palette: {
    primary: { main: "#363b98" },
    secondary: { main: "#b09ce8" },
  },
  typography: {
    fontFamily: `"Open Sans", sans-serif, "Roboto", "Helvetica", "Arial"`,
  },
});
const ThemeProviders = ({ children }) => {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
};

export default ThemeProviders;
