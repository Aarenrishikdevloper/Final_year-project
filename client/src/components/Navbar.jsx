import React, { useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { makeStyles } from "@mui/styles";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { default as CertifyIcon } from "@mui/icons-material/AccountBalanceWalletTwoTone";
import MenuIcon from "@mui/icons-material/Menu"; // Changed from LinkIcon
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    // marginLeft: -12,
    // marginRight: 20,
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
    fontWeight: "900",
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  menuItemLink: {
    textDecoration: "none",
    color: "inherit",
  },
}));

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const classes = useStyles();
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <Link href={"/"} className={classes.menuItemLink}>
        <MenuItem style={{ justifyContent: "flex-end" }}>Home</MenuItem>
      </Link>

      <Link href={"/admin"} className={classes.menuItemLink}>
        <MenuItem style={{ justifyContent: "flex-end" }}>
          Central Authority Portal
        </MenuItem>
      </Link>

      <Link href="/institute" passHref className={classes.menuItemLink}>
        <MenuItem style={{ justifyContent: "flex-end" }}>
          Institute Portal
        </MenuItem>
      </Link>

      <Link href="/view" passHref className={classes.menuItemLink}>
        <MenuItem style={{ justifyContent: "flex-end" }}>
          View Certificate
        </MenuItem>
      </Link>

      <Link href="/student" passHref className={classes.menuItemLink}>
        <MenuItem style={{ justifyContent: "flex-end" }}>
          Student Login
        </MenuItem>
      </Link>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static" color="white">
        <Toolbar>
          <Link href="/" passHref className={classes.menuItemLink}>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Icon"
            >
              <CertifyIcon color="primary" />
            </IconButton>
          </Link>
          <Typography
            className={classes.title}
            variant="h6"
            color="primary"
            noWrap
          >
            ...
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              aria-owns={isMenuOpen ? "material-appbar" : undefined}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <MenuIcon /> {/* Changed to menu icon */}
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon /> {/* Changed to menu icon */}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
      {renderMobileMenu}
    </div>
  );
};

export default NavBar;
