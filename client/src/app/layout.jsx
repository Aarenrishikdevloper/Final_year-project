import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import ThemeProviders from "@/Theme/ThemeProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title:
    "Secure and Immutable System for Storing and Retrieving Educational Certificates Using Blockchain",
  description: "Powered By Blockchain & Third Web Storage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeProviders>
            <Toaster position="bottom-center" />
            {children}
          </ThemeProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
