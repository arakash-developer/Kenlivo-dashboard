"use client";

import styles from "@/components/Users/Search.module.css";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
}

const CARDS_PER_PAGE = 12;

const roleLabel = (role: string) => {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const avatarColor = (name: string) => {
  const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const TeamMembers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const openMenu = (id: string, el: HTMLElement) =>
    setAnchorEls((prev) => ({ ...prev, [id]: el }));
  const closeMenu = (id: string) =>
    setAnchorEls((prev) => ({ ...prev, [id]: null }));

  const handleDelete = async (id: string) => {
    closeMenu(id);
    if (!confirm("Delete this user?")) return;
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchUsers();
  };

  return (
    <>
      <Card
        sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }}
        className="rmui-card"
      >
        <Box sx={{ display: { sm: "flex" }, alignItems: "center", justifyContent: "space-between" }}>
          <Box component="form" className={styles.searchBox} sx={{ width: { sm: "265px" }, mb: { xs: "10px", sm: "0" } }}>
            <label><i className="material-symbols-outlined">search</i></label>
            <input
              type="text"
              className={styles.inputSearch}
              placeholder="Search here....."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </Box>

          <Box>
            <Link href="/users/add-user/">
              <Button
                variant="outlined"
                sx={{ textTransform: "capitalize", borderRadius: "7px", fontWeight: "500", fontSize: "13px", padding: "6px 13px" }}
                color="primary"
              >
                <AddIcon sx={{ position: "relative", top: "-1px" }} /> Add New Member
              </Button>
            </Link>
          </Box>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
          <Typography>No members found.</Typography>
        </Box>
      ) : (
        <>
          <Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
            {paginated.map((user) => (
              <Grid key={user._id} item xs={12} sm={6} md={6} lg={6} xl={3}>
                <Card
                  sx={{ boxShadow: "none", borderRadius: "7px", padding: { xs: "18px", sm: "20px", lg: "25px" }, mb: "25px" }}
                  className="rmui-card team-member-card"
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "15px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={65}
                          height={65}
                          style={{ borderRadius: "100px", objectFit: "cover", flexShrink: 0 }}
                          unoptimized
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 65, height: 65, borderRadius: "100px", flexShrink: 0,
                            background: avatarColor(user.name),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: "22px",
                          }}
                        >
                          {initials(user.name)}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="h6" fontSize="16px" className="text-black">
                          {user.name}
                        </Typography>
                        <Typography sx={{ fontSize: "13px" }}>
                          <span style={{
                            background: user.role === "super_admin" ? "#7c3aed22" : user.role === "admin" ? "#2563eb22" : "#e5e7eb",
                            color: user.role === "super_admin" ? "#7c3aed" : user.role === "admin" ? "#2563eb" : "#374151",
                            padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
                          }}>
                            {roleLabel(user.role)}
                          </span>
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => openMenu(user._id, e.currentTarget)}
                      >
                        <MoreHorizIcon sx={{ fontSize: "25px" }} />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEls[user._id] ?? null}
                        open={Boolean(anchorEls[user._id])}
                        onClose={() => closeMenu(user._id)}
                        PaperProps={{
                          elevation: 0,
                          sx: { overflow: "visible", boxShadow: "0px 1px 7px #ddd", mt: 0 },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                      >
                        <MenuItem component={Link} href="/users/users-list/" onClick={() => closeMenu(user._id)}>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDelete(user._id)} sx={{ color: "error.main" }}>
                          Delete
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>

                  <Box mb="15px">
                    <Box className="text-black" mt="10px">
                      Joined Date:{" "}
                      <span className="text-body ml-5">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </span>
                    </Box>
                    <Box className="text-black" mt="10px">
                      Email Address:{" "}
                      <span className="text-body ml-5">{user.email}</span>
                    </Box>
                    <Box className="text-black" mt="10px">
                      Phone Number:{" "}
                      <span className="text-body ml-5">{user.phone || "—"}</span>
                    </Box>
                    <Box className="text-black" mt="10px">
                      Status:{" "}
                      <span className="ml-5">
                        <span className={`kenlivo-badge ${user.isActive !== false ? "active" : "Deactive"}`} style={{ textTransform: "capitalize" }}>
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default TeamMembers;
