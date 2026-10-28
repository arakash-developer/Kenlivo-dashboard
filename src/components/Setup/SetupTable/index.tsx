"use client";

import styles from "./SetupTable.module.css";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogTitle,
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
import PropTypes from "prop-types";
import React, { FormEvent, useEffect, useState } from "react";

interface SetupItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

interface Props {
  entity: string;
  label: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(2) },
  "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}));

interface BootstrapDialogTitleProps {
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle({ children, onClose, ...other }: BootstrapDialogTitleProps) {
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}
BootstrapDialogTitle.propTypes = { children: PropTypes.node, onClose: PropTypes.func.isRequired };

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

const SetupTable: React.FC<Props> = ({ entity, label }) => {
  const [items, setItems] = useState<SetupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addStatus, setAddStatus] = useState("active");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("active");

  const apiUrl = `/api/setup/${entity}`;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filtered.length) : 0;

  // ── Add handlers ──
  const openAdd = () => {
    setAddName(""); setAddDescription(""); setAddStatus("active"); setAddError("");
    setAddOpen(true);
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addName.trim()) { setAddError("Name is required"); return; }
    setAddSubmitting(true); setAddError("");
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), description: addDescription.trim(), isActive: addStatus === "active" }),
      });
      const json = await res.json();
      if (!res.ok) { setAddError(json.message ?? "Failed to create"); return; }
      await fetchItems();
      setAddOpen(false);
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAddSubmitting(false);
    }
  };

  // ── Edit handlers ──
  const openEdit = (row: SetupItem) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDescription(row.description ?? "");
    setEditStatus(row.isActive ? "active" : "inactive");
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editName.trim()) { setEditError("Name is required"); return; }
    setEditSubmitting(true); setEditError("");
    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name: editName.trim(), description: editDescription.trim(), isActive: editStatus === "active" }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.message ?? "Failed to update"); return; }
      await fetchItems();
      setEditOpen(false);
    } catch {
      setEditError("Network error. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${label.toLowerCase()}?`)) return;
    await fetch(apiUrl, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchItems();
  };

  const modalFields = (
    name: string, setName: (v: string) => void,
    description: string, setDescription: (v: string) => void,
    status: string, setStatus: (v: string) => void,
    error: string,
    submitting: boolean,
    onCancel: () => void,
    submitLabel: string,
  ) => (
    <Grid container alignItems="center" spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Name *</Typography>
        <TextField
          required fullWidth label="Enter name" autoFocus
          value={name} onChange={(e) => setName(e.target.value)}
          InputProps={{ style: { borderRadius: 8 } }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Status</Typography>
        <FormControl fullWidth>
          <InputLabel id="status-label">Select</InputLabel>
          <Select labelId="status-label" value={status} label="Select"
            onChange={(e: SelectChangeEvent) => setStatus(e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Description</Typography>
        <textarea
          placeholder="Description" rows={4}
          value={description} onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", borderRadius: "6px", padding: "10px 15px", border: "1px solid #D5D9E2", outline: "none", fontFamily: "inherit", fontSize: 14 }}
        />
      </Grid>
      {error && (
        <Grid item xs={12}>
          <Typography color="error" sx={{ fontSize: "13px" }}>{error}</Typography>
        </Grid>
      )}
      <Grid item xs={12} mt={1}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
          <Button onClick={onCancel} variant="outlined" color="error" disabled={submitting}
            sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "13px", padding: "11px 30px" }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}
            sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "13px", padding: "11px 30px", color: "#fff !important" }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : submitLabel}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
        <Box sx={{ display: { xs: "block", sm: "flex" }, alignItems: "center", justifyContent: "space-between", mb: "25px" }}>
          <form className={styles.searchBox} onSubmit={(e) => e.preventDefault()}>
            <label><i className="material-symbols-outlined">search</i></label>
            <input
              type="text"
              className={styles.inputSearch}
              placeholder={`Search ${label.toLowerCase()} here...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </form>
          <Button onClick={openAdd} variant="outlined"
            sx={{ textTransform: "capitalize", borderRadius: "7px", fontWeight: "500", fontSize: "13px", padding: "6px 13px" }}
            color="primary">
            <AddIcon sx={{ position: "relative", top: "-1px" }} /> Add New {label}
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: "7px" }} className="rmui-table border">
          <Table sx={{ minWidth: 700 }} aria-label={`${label} Table`}>
            <TableHead className="bg-f6f7f9">
              <TableRow>
                {["#", "Name", "Slug", "Description", "Status", "Action"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: "500", padding: "10px 20px", fontSize: "14px" }} className="text-black border-bottom">{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#888" }}>No {label.toLowerCase()} found.</TableCell></TableRow>
              ) : (
                (rowsPerPage > 0 ? filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filtered).map((row) => (
                  <TableRow key={row._id}>
                    <TableCell sx={{ padding: "5px 13px", fontSize: "14px", width: "65px" }} className="border-bottom">
                      <Checkbox sx={{ padding: "8px" }} />
                    </TableCell>
                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="text-black border-bottom">{row.name}</TableCell>
                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="border-bottom">{row.slug}</TableCell>
                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="border-bottom">{row.description || "—"}</TableCell>
                    <TableCell sx={{ padding: "15px 20px" }} className="border-bottom">
                      <div className={`kenlivo-badge ${row.isActive ? "active" : "Deactive"}`} style={{ textTransform: "capitalize" }}>
                        {row.isActive ? "Active" : "Inactive"}
                      </div>
                    </TableCell>
                    <TableCell sx={{ padding: "15px 20px" }} className="border-bottom">
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
              {emptyRows > 0 && <TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={6} /></TableRow>}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={6} count={filtered.length} rowsPerPage={rowsPerPage} page={page}
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

      {/* ── Add Modal ── */}
      <BootstrapDialog onClose={() => setAddOpen(false)} open={addOpen} className="rmu-modal">
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f6f7f9", padding: { xs: "15px 20px", md: "25px" } }} className="rmu-modal-header">
            <Typography variant="h6" sx={{ fontWeight: "600", fontSize: { xs: "16px", md: "18px" } }} className="text-black">
              Add New {label}
            </Typography>
            <IconButton aria-label="remove" size="small" onClick={() => setAddOpen(false)}><ClearIcon /></IconButton>
          </Box>
          <Box className="rmu-modal-content">
            <Box component="form" noValidate onSubmit={handleAdd}>
              <Box sx={{ padding: "25px", borderRadius: "8px" }} className="bg-white">
                {modalFields(addName, setAddName, addDescription, setAddDescription, addStatus, setAddStatus, addError, addSubmitting, () => setAddOpen(false), "Create")}
              </Box>
            </Box>
          </Box>
        </Box>
      </BootstrapDialog>

      {/* ── Edit Modal ── */}
      <BootstrapDialog onClose={() => setEditOpen(false)} open={editOpen} className="rmu-modal">
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f6f7f9", padding: { xs: "15px 20px", md: "25px" } }} className="rmu-modal-header">
            <Typography variant="h6" sx={{ fontWeight: "600", fontSize: { xs: "16px", md: "18px" } }} className="text-black">
              Edit {label}
            </Typography>
            <IconButton aria-label="remove" size="small" onClick={() => setEditOpen(false)}><ClearIcon /></IconButton>
          </Box>
          <Box className="rmu-modal-content">
            <Box component="form" noValidate onSubmit={handleEdit}>
              <Box sx={{ padding: "25px", borderRadius: "8px" }} className="bg-white">
                {modalFields(editName, setEditName, editDescription, setEditDescription, editStatus, setEditStatus, editError, editSubmitting, () => setEditOpen(false), "Save Changes")}
              </Box>
            </Box>
          </Box>
        </Box>
      </BootstrapDialog>
    </>
  );
};

export default SetupTable;
