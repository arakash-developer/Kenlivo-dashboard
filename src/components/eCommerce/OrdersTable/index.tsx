"use client";

import NextLink from "next/link";
import * as React from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
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
  Typography,
} from "@mui/material";
import styles from "@/components/eCommerce/Search.module.css";

const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

interface DashboardOrder {
  _id: string;
  user?: string;
  items: Array<{ name: string; quantity: number }>;
  shippingAddress?: { fullName?: string; phone?: string };
  paymentMethod?: string;
  grandTotal?: number;
  status: OrderStatus;
  createdAt?: string;
}

interface OrdersResponse {
  success: boolean;
  message?: string;
  data: DashboardOrder[];
  meta?: { total: number };
}

const OrdersTable: React.FC = () => {
  const [orders, setOrders] = React.useState<DashboardOrder[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [searchText, setSearchText] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
    });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    setLoading(true);
    setError("");
    fetch(`/api/orders/?${params.toString()}`)
      .then(async (response) => {
        const result = (await response.json()) as OrdersResponse;
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load orders.");
        }
        return result;
      })
      .then((result) => {
        if (!active) return;
        setOrders(result.data);
        setTotal(result.meta?.total ?? result.data.length);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Could not load orders.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, rowsPerPage, search, statusFilter]);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    setError("");
    try {
      const response = await fetch("/api/orders/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });
      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update order status.");
      }
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? { ...order, status } : order)),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchText.trim());
  };

  return (
    <Card
      sx={{
        boxShadow: "none",
        borderRadius: "7px",
        mb: "25px",
        padding: { xs: "18px", sm: "20px", lg: "25px" },
      }}
      className="rmui-card"
    >
      <Box>
        <Box
          sx={{
            display: { xs: "block", sm: "flex" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            mb: "25px",
          }}
        >
          <Box
            component="form"
            onSubmit={submitSearch}
            className={styles.searchBox}
            sx={{ width: "265px" }}
          >
            <label htmlFor="orders-search">
              <i className="material-symbols-outlined">search</i>
            </label>
            <input
              id="orders-search"
              type="search"
              className={styles.inputSearch}
              placeholder="Search order or customer..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mt: { xs: "14px", sm: 0 } }}>
            <Select
              size="small"
              value={statusFilter}
              onChange={(event) => {
                setPage(0);
                setStatusFilter(event.target.value);
              }}
              displayEmpty
              aria-label="Filter orders by status"
              sx={{ minWidth: "150px", textTransform: "capitalize" }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {ORDER_STATUSES.map((status) => (
                <MenuItem key={status} value={status} sx={{ textTransform: "capitalize" }}>
                  {status}
                </MenuItem>
              ))}
            </Select>
            <Button
              component={NextLink}
              href="/ecommerce/orders/create/"
              variant="outlined"
              sx={{
                textTransform: "capitalize",
                borderRadius: "7px",
                fontWeight: "500",
                fontSize: "13px",
                padding: "6px 13px",
                whiteSpace: "nowrap",
              }}
              color="primary"
            >
              Create order
            </Button>
          </Box>
        </Box>

        {error && (
          <Typography role="alert" color="error" sx={{ mb: 2, fontSize: "14px" }}>
            {error}
          </Typography>
        )}

        <TableContainer
          component={Paper}
          sx={{ boxShadow: "none", borderRadius: "7px" }}
          className="rmui-table border"
        >
          <Table sx={{ minWidth: 950 }} aria-label="Orders">
            <TableHead className="bg-f6f7f9">
              <TableRow>
                {["Order ID", "Customer", "Items", "Created", "Total", "Payment", "Status", "Manage"].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{ fontWeight: "500", padding: "10px 20px", fontSize: "14px" }}
                    className="text-black border-bottom"
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} aria-label="Loading orders" />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="text-black border-bottom" sx={{ padding: "14px 20px", fontSize: "13px" }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="border-bottom" sx={{ padding: "14px 20px" }}>
                      <Typography className="text-black" sx={{ fontSize: "14px", fontWeight: 500 }}>
                        {order.shippingAddress?.fullName || "Customer"}
                      </Typography>
                      {order.shippingAddress?.phone && (
                        <Typography color="text.secondary" sx={{ fontSize: "12px" }}>
                          {order.shippingAddress.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell className="text-black border-bottom" sx={{ padding: "14px 20px", fontSize: "13px" }}>
                      {order.items.reduce((quantity, item) => quantity + item.quantity, 0)} item(s)
                    </TableCell>
                    <TableCell className="text-black border-bottom" sx={{ padding: "14px 20px", fontSize: "13px" }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-black border-bottom" sx={{ padding: "14px 20px", fontSize: "13px" }}>
                      ৳{Number(order.grandTotal ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-black border-bottom" sx={{ padding: "14px 20px", fontSize: "13px", textTransform: "capitalize" }}>
                      {(order.paymentMethod || "—").replaceAll("_", " ")}
                    </TableCell>
                    <TableCell className="border-bottom" sx={{ padding: "14px 20px" }}>
                      <span className="kenlivo-badge" style={{ textTransform: "capitalize" }}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="border-bottom" sx={{ padding: "10px 12px" }}>
                      <Select
                        size="small"
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(event) => changeStatus(order._id, event.target.value as OrderStatus)}
                        aria-label={`Update status for order ${order._id}`}
                        sx={{ minWidth: "135px", textTransform: "capitalize", fontSize: "13px" }}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status} sx={{ textTransform: "capitalize" }}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={8}
                  count={total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_event, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(Number.parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  sx={{ border: "none" }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
};

export default OrdersTable;
