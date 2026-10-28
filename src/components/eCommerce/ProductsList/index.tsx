"use client";

import styles from "@/components/eCommerce/Search.module.css";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  images?: string[];
  price: number;
  finalPrice?: number;
  discountPercentage?: number;
  stock: number;
  rating?: number;
  numReviews?: number;
  isActive: boolean;
  categoryName?: string;
  createdAt?: string;
}

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }: {
  count: number; page: number; rowsPerPage: number;
  onPageChange: (e: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ flexShrink: 0, display: "flex", gap: "10px", padding: "14px 20px" }}>
      <IconButton onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0} sx={{ borderRadius: "4px", padding: "6px" }} className="border">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={(e) => onPageChange(e, page + 1)} disabled={page >= Math.ceil(count / rowsPerPage) - 1} sx={{ borderRadius: "4px", padding: "6px" }} className="border">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </Box>
  );
}

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filtered.length) : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchProducts();
  };

  return (
    <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
      <Box sx={{ display: { xs: "block", sm: "flex" }, alignItems: "center", justifyContent: "space-between", mb: "25px" }}>
        <Box component="form" className={styles.searchBox} sx={{ width: "265px" }}>
          <label><i className="material-symbols-outlined">search</i></label>
          <input
            type="text"
            className={styles.inputSearch}
            placeholder="Search product here....."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </Box>
        <Link href="/ecommerce/create-product/">
          <Button
            variant="outlined"
            sx={{ textTransform: "capitalize", borderRadius: "7px", fontWeight: "500", fontSize: "13px", padding: "6px 13px" }}
            color="primary"
          >
            <AddIcon sx={{ position: "relative", top: "-1px" }} /> Add New Product
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: "7px" }} className="rmui-table border">
        <Table sx={{ minWidth: 1100 }} aria-label="Products Table">
          <TableHead className="bg-f6f7f9">
            <TableRow>
              {["Product", "Category", "Price", "Discount", "Stock", "Rating", "Status", "Action"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: "500", padding: "10px 20px", fontSize: "14px" }} className="text-black border-bottom">{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "#888" }}>No products found.</TableCell></TableRow>
            ) : (
              (rowsPerPage > 0 ? filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filtered).map((row) => (
                <TableRow key={row._id}>
                  <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="border-bottom">
                    <Box sx={{ display: "flex", alignItems: "center", gap: "13px" }}>
                      {row.images?.[0] ? (
                        <Image src={row.images[0]} alt={row.name} width={44} height={44} style={{ borderRadius: "7px", objectFit: "cover", flexShrink: 0 }} unoptimized />
                      ) : (
                        <Box sx={{ width: 44, height: 44, borderRadius: "7px", background: "#f6f7f9", flexShrink: 0 }} />
                      )}
                      <Box>
                        <Typography sx={{ fontSize: "15px", fontWeight: "500" }} className="text-black">{row.name}</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#888" }}>
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="text-black border-bottom">
                    {row.categoryName || "—"}
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="text-black border-bottom">
                    ${row.finalPrice ?? row.price}
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="text-black border-bottom">
                    {row.discountPercentage ? `${row.discountPercentage}%` : "—"}
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="text-black border-bottom">
                    {row.stock > 0 ? row.stock : <span style={{ color: "#ef4444" }}>Out of stock</span>}
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px", fontSize: "14px" }} className="text-black border-bottom">
                    {row.rating ? `${row.rating} (${row.numReviews ?? 0})` : "—"}
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px" }} className="border-bottom">
                    <div className={`kenlivo-badge ${row.isActive ? "active" : "Deactive"}`} style={{ textTransform: "capitalize" }}>
                      {row.isActive ? "Active" : "Inactive"}
                    </div>
                  </TableCell>
                  <TableCell sx={{ padding: "14px 20px" }} className="border-bottom">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Link href={`/ecommerce/products-list/${row._id}/`}>
                        <IconButton aria-label="view" color="primary" sx={{ padding: "5px" }}>
                          <i className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</i>
                        </IconButton>
                      </Link>
                      <Link href={`/ecommerce/edit-product/${row._id}/`}>
                        <IconButton aria-label="edit" color="secondary" sx={{ padding: "5px" }}>
                          <i className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</i>
                        </IconButton>
                      </Link>
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
  );
};

export default ProductsList;
