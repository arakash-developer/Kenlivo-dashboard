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
import React, { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface SetupItem {
  _id: string;
  name: string;
  isActive: boolean;
}

interface EditProductProps {
  id: string;
}

const EditProduct: React.FC<EditProductProps> = ({ id }) => {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [collection, setCollection] = useState("");
  const [brand, setBrand] = useState("");
  const [productType, setProductType] = useState("");
  const [primaryImage, setPrimaryImage] = useState("");
  const [secondaryImages, setSecondaryImages] = useState(["", "", "", ""]);
  const [isActive, setIsActive] = useState(true);

  // Options from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SetupItem[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<SetupItem[]>([]);
  const [brandOptions, setBrandOptions] = useState<SetupItem[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<SetupItem[]>([]);

  // Page state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = (url: string, setter: (d: SetupItem[]) => void) =>
      fetch(url).then((r) => r.json()).then((j) => setter((j.data ?? []).filter((x: SetupItem) => x.isActive))).catch(() => {});

    fetch("/api/categories").then((r) => r.json()).then((j) => setCategories((j.data ?? []).filter((c: Category & { isActive?: boolean }) => c.isActive !== false))).catch(() => {});
    load("/api/setup/vendors", setVendorOptions);
    load("/api/setup/collections", setCollectionOptions);
    load("/api/setup/brands", setBrandOptions);
    load("/api/setup/product-types", setProductTypeOptions);

    // Load the product
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) { setError("Product not found."); return; }
        const p = j.data;
        setName(p.name ?? "");
        setDescription(p.description ?? "");
        setTagline(p.tagline ?? "");
        setPrice(String(p.price ?? ""));
        setDiscountPercentage(String(p.discountPercentage ?? 0));
        setStock(String(p.stock ?? 0));
        setCategory(p.category ?? "");
        setVendor(p.vendor ?? "");
        setCollection(p.collection ?? "");
        setBrand(p.brand ?? "");
        setProductType(p.productType ?? "");
        setIsActive(p.isActive !== false);
        const imgs: string[] = Array.isArray(p.images) ? p.images : [];
        setPrimaryImage(imgs[0] ?? "");
        setSecondaryImages([imgs[1] ?? "", imgs[2] ?? "", imgs[3] ?? "", imgs[4] ?? ""]);
      })
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !category) {
      setError("Product name, price and category are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    const images = [primaryImage, ...secondaryImages].map((u) => u.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: name.trim(),
          description,
          tagline: tagline.trim(),
          price: Number(price),
          discountPercentage: Number(discountPercentage),
          category,
          vendor,
          collection,
          brand,
          productType,
          images,
          stock: Number(stock),
          isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? "Failed to update product."); return; }
      setSuccess("Product updated successfully.");
      setTimeout(() => router.push("/ecommerce/products-list/"), 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
        {/* Left column */}
        <Grid item xs={12} xl={8}>
          {/* Basic Info */}
          <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
            <Typography variant="h3" sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700, mb: "25px" }} className="text-black">
              Product Information
            </Typography>
            <Grid container spacing={3} columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Product Title *
                </Typography>
                <TextField required fullWidth placeholder="Enter product title" value={name} onChange={(e) => setName(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Product Type
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select type</InputLabel>
                  <Select value={productType} label="Select type" onChange={(e: SelectChangeEvent) => setProductType(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {productTypeOptions.map((t) => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Tagline
                </Typography>
                <TextField fullWidth placeholder="Short tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Brand Name
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select brand</InputLabel>
                  <Select value={brand} label="Select brand" onChange={(e: SelectChangeEvent) => setBrand(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {brandOptions.map((b) => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Description
                </Typography>
                <textarea
                  placeholder="Product description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", borderRadius: "6px", padding: "10px 15px", border: "1px solid #D5D9E2", outline: "none", fontFamily: "inherit", fontSize: 14, resize: "vertical" }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Pricing & Stock */}
          <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
            <Typography variant="h3" sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700, mb: "25px" }} className="text-black">
              Pricing & Stock
            </Typography>
            <Grid container spacing={3} columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
              <Grid item xs={12} md={4}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Regular Price *
                </Typography>
                <TextField required fullWidth type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Discount %
                </Typography>
                <TextField fullWidth type="number" placeholder="0" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Stock
                </Typography>
                <TextField fullWidth type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
              </Grid>
            </Grid>
          </Card>

          {/* Images */}
          <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
            <Typography variant="h3" sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700, mb: "25px" }} className="text-black">
              Product Images
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Primary Image URL
                </Typography>
                <TextField fullWidth placeholder="https://example.com/image.jpg" value={primaryImage} onChange={(e) => setPrimaryImage(e.target.value)} InputProps={{ style: { borderRadius: 8 } }} />
              </Grid>
              {secondaryImages.map((img, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                    Secondary Image {i + 1}
                  </Typography>
                  <TextField
                    fullWidth placeholder="https://example.com/image.jpg"
                    value={img}
                    onChange={(e) => {
                      const updated = [...secondaryImages];
                      updated[i] = e.target.value;
                      setSecondaryImages(updated);
                    }}
                    InputProps={{ style: { borderRadius: 8 } }}
                  />
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} xl={4}>
          {/* Category & Org */}
          <Card sx={{ boxShadow: "none", borderRadius: "7px", mb: "25px", padding: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
            <Typography variant="h3" sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700, mb: "25px" }} className="text-black">
              Organisation
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Category *
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select category</InputLabel>
                  <Select value={category} label="Select category" onChange={(e: SelectChangeEvent) => setCategory(e.target.value)} sx={{ borderRadius: 2 }}>
                    {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Vendor
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select vendor</InputLabel>
                  <Select value={vendor} label="Select vendor" onChange={(e: SelectChangeEvent) => setVendor(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {vendorOptions.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Collection
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select collection</InputLabel>
                  <Select value={collection} label="Select collection" onChange={(e: SelectChangeEvent) => setCollection(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {collectionOptions.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                  Status
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={isActive ? "active" : "inactive"} label="Status" onChange={(e: SelectChangeEvent) => setIsActive(e.target.value === "active")} sx={{ borderRadius: 2 }}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Actions */}
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
              {submitting ? <CircularProgress size={18} color="inherit" /> : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="error"
              disabled={submitting}
              onClick={() => router.push("/ecommerce/products-list/")}
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

export default EditProduct;
