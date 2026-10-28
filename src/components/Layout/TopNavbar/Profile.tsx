"use client";

import * as React from "react";
import {
  IconButton,
  Typography,
  Box,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import Link from "next/link";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ChatIcon from "@mui/icons-material/Chat";
import ListIcon from "@mui/icons-material/List";
import Logout from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportIcon from "@mui/icons-material/Support";
import LockOpenIcon from "@mui/icons-material/LockOpen";

interface SessionUser {
  name: string;
  email: string;
  role: string;
  image?: string;
}

const Profile: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => { if (j.data) setUser(j.data); })
      .catch(() => {});
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const displayName = user?.name ?? "Admin";
  const firstName = displayName.split(" ")[0];
  const avatarSrc = user?.image || undefined;

  const roleLabel = (role: string) => {
    if (role === "super_admin") return "Super Admin";
    if (role === "admin") return "Admin";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ p: 0, borderRadius: "5px" }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={avatarSrc}
            alt={displayName}
            sx={{
              width: { xs: "35px", sm: "42px" },
              height: { xs: "35px", sm: "42px" },
              border: "2px solid #C2CDFF",
            }}
            className="mr-8"
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: "600",
              fontSize: "13px",
              display: { xs: "none", sm: "block" },
            }}
            className="text-black"
          >
            {firstName}
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: "15px" }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "7px",
            boxShadow: "0 4px 45px #0000001a",
            overflow: "visible",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        className="for-dark-top-navList"
      >
        <MenuItem sx={{ padding: "10px 20px" }}>
          <Avatar
            src={avatarSrc}
            alt={displayName}
            sx={{ width: 31, height: 31, border: "2px solid #C2CDFF" }}
            className="mr-8"
          />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontSize: "13px", color: "#260944", fontWeight: "500" }}
              className="text-black"
            >
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: "12px" }}>
              {user ? roleLabel(user.role) : ""}
            </Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ borderColor: "#F6F7F9" }} />

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/my-profile/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <AccountCircleIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>My Profile</span>
          </Link>
        </MenuItem>

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/apps/chat/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <ChatIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>Messages</span>
          </Link>
        </MenuItem>

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/apps/to-do-list/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <ListIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>My Task</span>
          </Link>
        </MenuItem>

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/ecommerce/checkout/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <CreditCardIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>Billing</span>
          </Link>
        </MenuItem>

        <Divider sx={{ borderColor: "#F6F7F9" }} />

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/settings/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <SettingsIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>Settings</span>
          </Link>
        </MenuItem>

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/faq/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <SupportIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>Support</span>
          </Link>
        </MenuItem>

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/authentication/lock-screen/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <LockOpenIcon sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>Lock Screen</span>
          </Link>
        </MenuItem>

        <MenuItem sx={{ padding: "8px 20px" }}>
          <Link href="/authentication/logout/" className="text-black" style={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon sx={{ mr: "-10px", mt: "-3px" }}>
              <Logout sx={{ fontSize: "20px" }} className="text-black" />
            </ListItemIcon>
            <span style={{ fontSize: "13px" }}>Logout</span>
          </Link>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Profile;
