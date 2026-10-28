"use client";

import * as React from "react";
import { Card, Box, Typography } from "@mui/material";
import { useProfile } from "@/hooks/useProfile";

const ProfileInformation: React.FC = () => {
  const { user } = useProfile();
  const roleLabel = user?.role === "admin" ? "Administrator" : "Customer";
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "7px",
          mb: "25px",
          padding: { xs: "18px", sm: "20px", lg: "25px" },
        }}
        className="rmui-card"
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 700,
            mb: "20px",
          }}
          className="text-black"
        >
          Profile Information
        </Typography>

        <Box>
          <Box className="text-black" sx={{ fontWeight: "500", mt: "10px" }}>
            <Typography
              component="span"
              className="text-body"
              sx={{ fontWeight: "normal" }}
            >
              User ID:
            </Typography>{" "}
            {user?.id ?? "—"}
          </Box>

          <Box className="text-black" sx={{ fontWeight: "500", mt: "10px" }}>
            <Typography
              component="span"
              className="text-body"
              sx={{ fontWeight: "normal" }}
            >
              Full Name:
            </Typography>{" "}
            {user?.name ?? "—"}
          </Box>

          <Box className="text-black" sx={{ fontWeight: "500", mt: "10px" }}>
            <Typography
              component="span"
              className="text-body"
              sx={{ fontWeight: "normal" }}
            >
              Email:
            </Typography>{" "}
            {user?.email ?? "—"}
          </Box>

          <Box className="text-black" sx={{ fontWeight: "500", mt: "10px" }}>
            <Typography
              component="span"
              className="text-body"
              sx={{ fontWeight: "normal" }}
            >
              Role:
            </Typography>{" "}
            {roleLabel}
          </Box>

          <Box className="text-black" sx={{ fontWeight: "500", mt: "10px" }}>
            <Typography
              component="span"
              className="text-body"
              sx={{ fontWeight: "normal" }}
            >
              Phone:
            </Typography>{" "}
            {user?.phone ?? "—"}
          </Box>

          <Box className="text-black" sx={{ fontWeight: "500", mt: "10px" }}>
            <Typography
              component="span"
              className="text-body"
              sx={{ fontWeight: "normal" }}
            >
              Join Date:
            </Typography>{" "}
            {joinDate}
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default ProfileInformation;
