"use client";

import { Box, Typography } from "@mui/material";
import * as React from "react";

const Footer: React.FC = () => {
  return (
    <>
      <Box
        className="footer-area"
        sx={{
          textAlign: "center",
          bgcolor: "#fff",
          borderRadius: "7px 7px 0 0",
          padding: "20px 25px",
        }}
      >
        <Typography>
          © Kenlivo — Developed by AR{" "}
          <a href="https://arakash.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-purple">
            Akash
          </a>
        </Typography>
      </Box>
    </>
  );
};

export default Footer;
