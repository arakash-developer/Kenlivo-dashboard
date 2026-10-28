"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const AddUser: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
          isActive: status === "active",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to create user.");
        return;
      }
      setSuccess("User created successfully.");
      setTimeout(() => router.push("/users/users-list/"), 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
            <Typography variant="h6" sx={{ fontWeight: "600", fontSize: "16px", mb: "20px" }} className="text-black">
              User Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Full Name *
                </Typography>
                <TextField
                  required fullWidth placeholder="Enter full name"
                  value={name} onChange={(e) => setName(e.target.value)}
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Email Address *
                </Typography>
                <TextField
                  required fullWidth type="email" placeholder="Enter email address"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Password *
                </Typography>
                <TextField
                  required fullWidth type="password" placeholder="Enter password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Phone Number
                </Typography>
                <TextField
                  fullWidth placeholder="Enter phone number"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
            <Typography variant="h6" sx={{ fontWeight: "600", fontSize: "16px", mb: "20px" }} className="text-black">
              Role & Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Role
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Role</InputLabel>
                  <Select value={role} label="Select Role" onChange={(e: SelectChangeEvent) => setRole(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                    <MenuItem value="customer">Customer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Status
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Status</InputLabel>
                  <Select value={status} label="Select Status" onChange={(e: SelectChangeEvent) => setStatus(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: "8px" }}>{success}</Alert>}
          <Box sx={{ display: "flex", gap: "10px" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "14px", padding: "12px 30px", color: "#fff !important" }}
            >
              {submitting ? <CircularProgress size={18} color="inherit" /> : "Create User"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="error"
              disabled={submitting}
              onClick={() => router.push("/users/users-list/")}
              sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "14px", padding: "12px 30px" }}
            >
              Cancel
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUser;
