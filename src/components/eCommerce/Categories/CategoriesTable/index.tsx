"use client";

import styles from "@/components/eCommerce/Categories/CategoriesTable/CategoriesTable.module.css";
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
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { styled, useTheme } from "@mui/material/styles";
import Image from "next/image";
import PropTypes from "prop-types";
import React, { FormEvent, useEffect, useState } from "react";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  isActive: boolean;
  totalProducts: number;
}

// Modal
interface BootstrapDialogTitleProps {
  children?: React.ReactNode;
  onClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(2) },
  "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}));

function BootstrapDialogTitle(props: BootstrapDialogTitleProps) {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}
BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  return (
    <Box sx={{ flexShrink: 0, display: "flex", gap: "10px", padding: "0 20px" }}>
      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label="previous page"
        sx={{ borderRadius: "4px", padding: "6px" }}
        className="border"
      >
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        sx={{ borderRadius: "4px", padding: "6px" }}
        className="border"
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </Box>
  );
}

const CategoriesTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editStatus, setEditStatus] = useState("active");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      setCategories(json.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filtered.length) : 0;

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setFormName("");
    setFormDescription("");
    setFormImage("");
    setStatus("active");
    setFormError("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formName.trim()) { setFormError("Name is required"); return; }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim(),
          image: formImage.trim() || null,
          isActive: status === "active",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.message ?? "Failed to create"); return; }
      await fetchCategories();
      handleClose();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (row: Category) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDescription(row.description ?? "");
    setEditImage(row.image ?? "");
    setEditStatus(row.isActive ? "active" : "inactive");
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editName.trim()) { setEditError("Name is required"); return; }
    setEditSubmitting(true); setEditError("");
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: editName.trim(),
          description: editDescription.trim(),
          image: editImage.trim() || null,
          isActive: editStatus === "active",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.message ?? "Failed to update"); return; }
      await fetchCategories();
      setEditOpen(false);
    } catch {
      setEditError("Network error. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCategories();
  };

  return (
    <>
      <Card
        sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }}
        className="rmui-card"
      >
        <Box
          sx={{ display: { xs: "block", sm: "flex" }, alignItems: "center", justifyContent: "space-between", mb: "25px" }}
        >
          <form className={styles.searchBox} onSubmit={(e) => e.preventDefault()}>
            <label>
              <i className="material-symbols-outlined">search</i>
            </label>
            <input
              type="text"
              className={styles.inputSearch}
              placeholder="Search category here....."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </form>

          <Button
            onClick={handleClickOpen}
            variant="outlined"
            sx={{ textTransform: "capitalize", borderRadius: "7px", fontWeight: "500", fontSize: "13px", padding: "6px 13px" }}
            color="primary"
          >
            <AddIcon sx={{ position: "relative", top: "-1px" }} /> Add New Category
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: "7px" }} className="rmui-table border">
          <Table sx={{ minWidth: 950 }} aria-label="Categories Table">
            <TableHead className="bg-f6f7f9">
              <TableRow>
                {["#", "Image", "Name", "Total Products", "Slug", "Description", "Status", "Action"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: "500", padding: "10px 20px", fontSize: "14px" }} className="text-black border-bottom">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#888" }}>
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                (rowsPerPage > 0
                  ? filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : filtered
                ).map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell sx={{ padding: "5px 13px", fontSize: "14px", width: "65px" }} className="border-bottom">
                      <Checkbox {...label} sx={{ padding: "8px" }} />
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.image ? (
                        <Image src={row.image} alt={row.name} width={50} height={50} style={{ borderRadius: "100px", objectFit: "cover" }} />
                      ) : (
                        <Box sx={{ width: 50, height: 50, borderRadius: "50%", bgcolor: "#f0dde0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {row.name.charAt(0).toUpperCase()}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="text-black border-bottom">
                      {row.name}
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.totalProducts}
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.slug}
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px", fontSize: "14px" }} className="border-bottom">
                      {row.description || "�"}
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px" }} className="border-bottom">
                      <div className={`kenlivo-badge ৳{row.isActive ? "active" : "Deactive"}`} style={{ textTransform: "capitalize" }}>
                        {row.isActive ? "Active" : "Inactive"}
                      </div>
                    </TableCell>

                    <TableCell sx={{ padding: "15px 20px" }} className="border-bottom">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton aria-label="view" color="primary" sx={{ padding: "5px" }}>
                          <i className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</i>
                        </IconButton>
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
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={8}
                  count={filtered.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{ select: { inputProps: { "aria-label": "rows per page" }, native: true } }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  sx={{ border: "none" }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Category Modal */}
      <BootstrapDialog onClose={() => setEditOpen(false)} aria-labelledby="edit-dialog-title" open={editOpen} className="rmu-modal">
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f6f7f9", padding: { xs: "15px 20px", md: "25px" } }} className="rmu-modal-header">
            <Typography id="edit-dialog-title" variant="h6" sx={{ fontWeight: "600", fontSize: { xs: "16px", md: "18px" } }} className="text-black">
              Edit Category
            </Typography>
            <IconButton aria-label="remove" size="small" onClick={() => setEditOpen(false)}>
              <ClearIcon />
            </IconButton>
          </Box>

          <Box className="rmu-modal-content">
            <Box component="form" noValidate onSubmit={handleEditSubmit}>
              <Box sx={{ padding: "25px", borderRadius: "8px" }} className="bg-white">
                <Grid container alignItems="center" spacing={2}>

                  <Grid item xs={12} md={12} lg={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Name *</Typography>
                    <TextField required fullWidth label="Enter name" value={editName} onChange={(e) => setEditName(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
                  </Grid>

                  <Grid item xs={12} md={12} lg={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Status</Typography>
                    <FormControl fullWidth>
                      <InputLabel id="edit-status-label">Select</InputLabel>
                      <Select labelId="edit-status-label" value={editStatus} label="Select" onChange={(e: SelectChangeEvent) => setEditStatus(e.target.value)} sx={{ borderRadius: 2 }}>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Description</Typography>
                    <textarea placeholder="Description" rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                      style={{ width: "100%", borderRadius: "6px", padding: "10px 15px", border: "1px solid #D5D9E2", outline: "none", fontFamily: "inherit", fontSize: 14 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">Image URL</Typography>
                    <TextField fullWidth label="https://..." value={editImage} onChange={(e) => setEditImage(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
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

      {/* Add Category Modal */}
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        className="rmu-modal"
      >
        <Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f6f7f9", padding: { xs: "15px 20px", md: "25px" } }}
            className="rmu-modal-header"
          >
            <Typography id="modal-modal-title" variant="h6" sx={{ fontWeight: "600", fontSize: { xs: "16px", md: "18px" } }} className="text-black">
              Add New Category
            </Typography>
            <IconButton aria-label="remove" size="small" onClick={handleClose}>
              <ClearIcon />
            </IconButton>
          </Box>

          <Box className="rmu-modal-content">
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Box sx={{ padding: "25px", borderRadius: "8px" }} className="bg-white">
                <Grid container alignItems="center" spacing={2}>

                  <Grid item xs={12} md={12} lg={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                      Name *
                    </Typography>
                    <TextField
                      name="name"
                      required
                      fullWidth
                      label="Enter name"
                      autoFocus
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      InputProps={{ style: { borderRadius: 8 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={12} lg={6}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                      Status
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Select</InputLabel>
                      <Select
                        labelId="status-label"
                        value={status}
                        label="Select"
                        onChange={(e: SelectChangeEvent) => setStatus(e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                      Description
                    </Typography>
                    <textarea
                      name="description"
                      placeholder="Description"
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      style={{ width: "100%", borderRadius: "6px", padding: "10px 15px", border: "1px solid #D5D9E2", outline: "none", fontFamily: "inherit", fontSize: 14 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                      Image URL
                    </Typography>
                    <TextField
                      name="image"
                      fullWidth
                      label="https://..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      InputProps={{ style: { borderRadius: 8 } }}
                    />
                  </Grid>

                  {formError && (
                    <Grid item xs={12}>
                      <Typography color="error" sx={{ fontSize: "13px" }}>{formError}</Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} mt={1}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
                      <Button
                        onClick={handleClose}
                        variant="outlined"
                        color="error"
                        disabled={submitting}
                        sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "13px", padding: "11px 30px" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: "500", fontSize: "13px", padding: "11px 30px", color: "#fff !important" }}
                      >
                        {submitting ? <CircularProgress size={18} color="inherit" /> : <><AddIcon sx={{ position: "relative", top: "-2px" }} className="mr-5px" /> Create</>}
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

export default CategoriesTable;
