"use client";

import { Box, Card, Typography } from "@mui/material";
import React from "react";

const BillingDetails: React.FC = () => {
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
          Billing Details
        </Typography>

        <Box>
          <Box mt="8px">
            <span className="text-black">Name:</span> Gary Fraser
          </Box>

          <Box mt="8px">
            <span className="text-black">Email:</span> example&#64;kenlivo.com
          </Box>

          <Box mt="8px">
            <span className="text-black">Phone:</span> +1 444 333 5566
          </Box>

          <Box mt="8px">
            <span className="text-black">Address:</span> 715 Maple St,
            Hamletville, England
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default BillingDetails;
