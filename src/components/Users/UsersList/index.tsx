"use client";

import styles from "@/components/Users/Search.module.css";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { SelectChangeEvent, styled, useTheme } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(2) },
  "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}));

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }: {
  count: number; page: number; rowsPerPage: number;
  onPageChange: (e: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ flexShrink: 0, display: "flex", gap: "10px", padding: "0 20px" }}>
      <IconButton onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0} sx={{ borderRadius: "4px", padding: "6px" }} className="border">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={(e) => onPageChange(e, page + 1)} disabled={page >= Math.ceil(count / rowsPerPage) - 1} sx={{ borderRadius: "4px", padding: "6px" }} className="border">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </Box>
  );
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("admin");
  const [editStatus, setEditStatus] = useState("active");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      setUsers(json.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filtered.length) : 0;

  const openEdit = (u: UserRow) => {
    setEditId(u._id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone ?? "");
    setEditRole(u.role ?? "admin");
    setEditStatus(u.isActive !== false ? "active" : "inactive");
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) { setEditError("Name and email are required"); return; }
    setEditSubmitting(true); setEditError("");
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim(), role: editRole, isActive: editStatus === "active" }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.message ?? "Failed to update"); return; }
      await fetchUsers();
      setEditOpen(false);
    } catch {
      setEditError("Network error. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchUsers();
  };

  const roleLabel = (role: string) => {
    if (role === "super_admin") return "Super Admin";
    if (role === "admin") return "Admin";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
        <Box sx={{ display: { xs: "block", sm: "flex" }, alignItems: "center", justifyContent: "space-between", mb: "25px" }}>
          <form className={styles.searchBox} onSubmit={(e) => e.preventDefault()}>
            <label><i className="material-symbols-outlined">search</i></label>
            <input
              type="text"
              className={styles.inputSearch}
              placeholder="Search users here..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </form>
          <Button
            component={Link}
            href="/users/add-user/"
            variant="outlined"
            sx={{ textTransform: "capitalize", borderRadius: "7px", fontWeight: "500", fontSize: "13px", padding: "6px 13px" }}
            color="primary"
          >
            + Add New User
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: "7px" }} className="rmui-table border">
          <Table sx={{ minWidth: 700 }} aria-label="Users Table">
            <TableHead className="bg-f6f7f9">
              <TableRow>
                {["#", "Name", "Email", "Phone", "Role", "Status", "Joined", "Action"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: "500", padding: "10px 20px", fontSize: "14px" }} className="text-black border-bottom">{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "#888" }}>No users found.</TableCell></TableRow>
              ) : (
                (rowsPerPage > 0 ? filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filtered).map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="border-bottom">
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px", fontSize: "14px", fontWeight: 500 }} className="text-black border-bottom">
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.email}
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.phone || "—"}
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="border-bottom">
                      <span style={{
                        background: row.role === "super_admin" ? "#7c3aed22" : row.role === "admin" ? "#2563eb22" : "#e5e7eb",
                        color: row.role === "super_admin" ? "#7c3aed" : row.role === "admin" ? "#2563eb" : "#374151",
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                      }}>
                        {roleLabel(row.role)}
                      </span>
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px" }} className="border-bottom">
                      <div className={`kenlivo-badge ${row.isActive !== false ? "active" : "Deactive"}`} style={{ textTransform: "capitalize" }}>
                        {row.isActive !== false ? "Active" : "Inactive"}
                      </div>
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell sx={{ padding: "14px 20px" }} className="border-bottom">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton aria-label="edit" color="secondary" sx={{ padding: "5px" }} onClick={() => openEdit(row)}>
                          <i className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</i>
                        </IconButton>
                        <IconButton aria-label="delete" color="error" sx={{ padding: "5px" }} onClick={() => handleDelete(row._id)}>
                          <i className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</i>
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {emptyRows > 0 && <TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={8} /></TableRow>}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={8} count={filtered.length} rowsPerPage={rowsPerPage} page={page}
                  slotProps={{ select: { inputProps: { "aria-label": "rows per page" }, native: true } }}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  ActionsComponent={TablePaginationActions}
                  sx={{ border: "none" }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Modal */}
      <BootstrapDialog onClose={() => setEditOpen(false)} open={editOpen} className="rmu-modal">
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f6f7f9", padding: { xs: "15px 20px", md: "25px" } }} className="rmu-modal-header">
            <Typography variant="h6" sx={{ fontWeight: "600", fontSize: { xs: "16px", md: "18px" } }} className="text-black">
              Edit User
            </Typography>
            <IconButton aria-label="remove" size="small" onClick={() => setEditOpen(false)}><ClearIcon /></IconButton>
          </Box>
          <Box className="rmu-modal-content">
            <Box component="form" noValidate onSubmit={handleEdit}>
              <Box sx={{ padding: "25px", borderRadius: "8px" }} className="bg-white">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Name *</Typography>
                    <TextField required fullWidth label="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Email *</Typography>
                    <TextField required fullWidth label="Email address" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Phone</Typography>
                    <TextField fullWidth label="Phone number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Role</Typography>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select value={editRole} label="Role" onChange={(e: SelectChangeEvent) => setEditRole(e.target.value)} sx={{ borderRadius: 2 }}>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="super_admin">Super Admin</MenuItem>
                        <MenuItem value="customer">Customer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Status</Typography>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select value={editStatus} label="Status" onChange={(e: SelectChangeEvent) => setEditStatus(e.target.value)} sx={{ borderRadius: 2 }}>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {editError && (
                    <Grid item xs={12}>
                      <Typography color="error" sx={{ fontSize: "13px" }}>{editError}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} mt={1}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
                      <Button onClick={() => setEditOpen(false)} variant="outlined" color="error" disabled={editSubmitting}
                        sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "13px", padding: "11px 30px" }}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" disabled={editSubmitting}
                        sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "13px", padding: "11px 30px", color: "#fff !important" }}>
                        {editSubmitting ? <CircularProgress size={18} color="inherit" /> : "Save Changes"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </BootstrapDialog>
    </>
  );
};

export default UsersList;
