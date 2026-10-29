"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CustomEditor from "./CustomEditor";

interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

interface SetupItem {
  _id: string;
  name: string;
  isActive: boolean;
}

const CreateProduct: React.FC = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagOptions, setTagOptions] = useState<SetupItem[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<SetupItem[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SetupItem[]>([]);
  const [brandOptions, setBrandOptions] = useState<SetupItem[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<SetupItem[]>([]);

  const [productTitle, setProductTitle] = useState("");
  const [productType, setProductType] = useState("");
  const [sku, setSku] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [productID, setProductID] = useState("");
  const [discountOffer, setDiscountOffer] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [collection, setCollection] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState("");
  const [secondaryImages, setSecondaryImages] = useState(["", "", "", ""]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = (url: string, setter: (d: SetupItem[]) => void) =>
      fetch(url).then((r) => r.json()).then((j) => setter((j.data ?? []).filter((x: SetupItem) => x.isActive))).catch(() => {});

    fetch("/api/categories").then((r) => r.json()).then((j) => setCategories((j.data ?? []).filter((c: Category) => c.isActive))).catch(() => {});
    load("/api/setup/tags", setTagOptions);
    load("/api/setup/collections", setCollectionOptions);
    load("/api/setup/vendors", setVendorOptions);
    load("/api/setup/brands", setBrandOptions);
    load("/api/setup/product-types", setProductTypeOptions);
  }, []);

  const handleMultipleSelectChange = (event: SelectChangeEvent<string[]>) => {
    const { target: { value } } = event;
    setSelectedTags(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!productTitle.trim()) { setError("Product title is required."); return; }
    if (!regularPrice || isNaN(Number(regularPrice)) || Number(regularPrice) <= 0) { setError("Enter a valid regular price."); return; }
    if (!category) { setError("Please select a category."); return; }

    setSubmitting(true);
    try {
      const price = Number(regularPrice);
      const finalPrice = salePrice && !isNaN(Number(salePrice)) ? Number(salePrice) : price;
      const discountPercentage = price > 0 ? Math.round((1 - finalPrice / price) * 100) : 0;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productTitle.trim(),
          description: description.trim() || metaDescription.trim(),
          tagline: "",
          price,
          discountPercentage,
          category,
          images: [primaryImage, ...secondaryImages].map((u) => u.trim()).filter(Boolean),
          stock: stock ? Number(stock) : 0,
          isActive: true,
          sku: sku.trim(),
          brandName: brandName.trim(),
          productType,
          vendor,
          collection,
          tags: selectedTags,
          productID: productID.trim(),
          metaTitle: metaTitle.trim(),
          metaDescription: metaDescription.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.message ?? "Failed to create product."); return; }

      setSuccess("Product created successfully!");
      setTimeout(() => router.push("/ecommerce/products-list/"), 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
          <Grid item xs={12} sm={12} md={6} lg={12} xl={8}>
            <Card
              sx={{
                boxShadow: "none",
                borderRadius: "7px",
                mb: "25px",
                padding: { xs: "18px", sm: "20px", lg: "25px" },
              }}
              className="rmui-card"
            >
              <Box sx={{ mb: "25px" }}>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700 }}
                  className="text-black"
                >
                  Add A Product
                </Typography>
              </Box>

              <Grid container spacing={3} columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Product Title
                      </Typography>
                      <TextField
                        label="Enter Product Title"
                        placeholder="E.g. Google Pixel 7 Pro"
                        variant="filled"
                        id="productTitle"
                        name="productTitle"
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        required
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Product Type
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="product-type-label">Select</InputLabel>
                      <Select
                        labelId="product-type-label"
                        id="product-type"
                        value={productType}
                        label="Select"
                        onChange={(e: SelectChangeEvent) => setProductType(e.target.value)}
                        sx={{ "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" } }}
                      >
                        {productTypeOptions.length === 0 && <MenuItem disabled value="">Loading�</MenuItem>}
                        {productTypeOptions.map((t) => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        SKU
                      </Typography>
                      <TextField
                        label="Enter sku"
                        placeholder="E.g. ABC-12345"
                        variant="filled"
                        id="sku"
                        name="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Brand Name
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="brand-name-label">Select</InputLabel>
                      <Select
                        labelId="brand-name-label"
                        id="brand-name"
                        value={brandName}
                        label="Select"
                        onChange={(e: SelectChangeEvent) => setBrandName(e.target.value)}
                        sx={{ "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" } }}
                      >
                        {brandOptions.length === 0 && <MenuItem disabled value="">Loading�</MenuItem>}
                        {brandOptions.map((b) => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Product Description
                    </Typography>
                    <CustomEditor />
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Regular Price
                      </Typography>
                      <TextField
                        label="Enter Regular Price"
                        placeholder="E.g. ৳99"
                        variant="filled"
                        id="regularPrice"
                        name="regularPrice"
                        type="number"
                        inputProps={{ min: 0, step: "0.01" }}
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        required
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Sale Price
                      </Typography>
                      <TextField
                        label="Enter Sale Price"
                        placeholder="E.g. ৳29"
                        variant="filled"
                        id="salePrice"
                        name="salePrice"
                        type="number"
                        inputProps={{ min: 0, step: "0.01" }}
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                    Publish Schedule
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      sx={{
                        width: "100%",
                        "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Product in Stock
                      </Typography>
                      <TextField
                        label="Enter Product in Stock"
                        placeholder="E.g. 17"
                        variant="filled"
                        id="stock"
                        name="stock"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Product ID
                      </Typography>
                      <TextField
                        label="Enter Product ID"
                        placeholder="E.g. #JAN-2345"
                        variant="filled"
                        id="productID"
                        name="productID"
                        value={productID}
                        onChange={(e) => setProductID(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Discount / Offer
                      </Typography>
                      <TextField
                        label="Enter Discount / Offer"
                        placeholder="E.g. ৳20"
                        variant="filled"
                        id="discountOffer"
                        name="discountOffer"
                        value={discountOffer}
                        onChange={(e) => setDiscountOffer(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                    Available Date
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      sx={{
                        width: "100%",
                        "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={6}>
                  <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                    End Date
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      sx={{
                        width: "100%",
                        "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Typography component="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }} className="text-black">
                    Upload Product Images
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <Typography component="label" sx={{ fontWeight: "500", fontSize: "13px", mb: "8px", display: "block", color: "#555" }}>
                          Primary Image URL
                        </Typography>
                        <TextField
                          label="https://example.com/primary.jpg"
                          variant="filled"
                          value={primaryImage}
                          onChange={(e) => setPrimaryImage(e.target.value)}
                          sx={{
                            "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                            "& .MuiInputBase-root::before": { border: "none" },
                            "& .MuiInputBase-root:hover::before": { border: "none" },
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {secondaryImages.map((url, i) => (
                      <Grid item xs={12} xl={6} key={i}>
                        <FormControl fullWidth>
                          <Typography component="label" sx={{ fontWeight: "500", fontSize: "13px", mb: "8px", display: "block", color: "#555" }}>
                            Secondary Image {i + 1}
                          </Typography>
                          <TextField
                            label={`https://example.com/image${i + 2}.jpg`}
                            variant="filled"
                            value={url}
                            onChange={(e) => {
                              const updated = [...secondaryImages];
                              updated[i] = e.target.value;
                              setSecondaryImages(updated);
                            }}
                            sx={{
                              "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                              "& .MuiInputBase-root::before": { border: "none" },
                              "& .MuiInputBase-root:hover::before": { border: "none" },
                            }}
                          />
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} sm={12} md={6} lg={12} xl={4}>
            <Card
              sx={{
                boxShadow: "none",
                borderRadius: "7px",
                mb: "25px",
                padding: { xs: "18px", sm: "20px", lg: "25px" },
              }}
              className="rmui-card"
            >
              <Box sx={{ mb: "25px" }}>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700 }}
                  className="text-black"
                >
                  Product Category & Tags
                </Typography>
              </Box>

              <Grid container spacing={3} columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Category
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="category-label">Select</InputLabel>
                      <Select
                        labelId="category-label"
                        id="category"
                        value={category}
                        label="select"
                        onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}
                        sx={{ "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" } }}
                      >
                        {categories.length === 0 && <MenuItem disabled value="">Loading�</MenuItem>}
                        {categories.map((c) => (
                          <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Vendor
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="vendor-label">Select</InputLabel>
                      <Select
                        labelId="vendor-label"
                        id="vendor"
                        value={vendor}
                        label="Select"
                        onChange={(e: SelectChangeEvent) => setVendor(e.target.value)}
                        sx={{ "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" } }}
                      >
                        {vendorOptions.length === 0 && <MenuItem disabled value="">Loading�</MenuItem>}
                        {vendorOptions.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Collection
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="collection-label">Select</InputLabel>
                      <Select
                        labelId="collection-label"
                        id="collection"
                        value={collection}
                        label="Select"
                        onChange={(e: SelectChangeEvent) => setCollection(e.target.value)}
                        sx={{ "& fieldset": { border: "1px solid #D5D9E2", borderRadius: "7px" } }}
                      >
                        {collectionOptions.length === 0 && <MenuItem disabled value="">Loading�</MenuItem>}
                        {collectionOptions.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                      Tags
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="tags-label">Select</InputLabel>
                      <Select
                        labelId="tags-label"
                        id="tags-select"
                        multiple
                        value={selectedTags}
                        onChange={handleMultipleSelectChange}
                        input={<OutlinedInput label="Select" />}
                        renderValue={(selected) => selected.join(", ")}
                      >
                        {tagOptions.map((t) => (
                          <MenuItem key={t._id} value={t._id}>
                            <Checkbox checked={selectedTags.indexOf(t._id) > -1} />
                            <ListItemText primary={t.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            <Card
              sx={{
                boxShadow: "none",
                borderRadius: "7px",
                mb: "25px",
                padding: { xs: "18px", sm: "20px", lg: "25px" },
              }}
              className="rmui-card"
            >
              <Box sx={{ mb: "25px" }}>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700 }}
                  className="text-black"
                >
                  Other Options
                </Typography>
              </Box>

              <Grid container spacing={3} columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Title
                      </Typography>
                      <TextField
                        label="Enter Title"
                        placeholder="E.g. Google Pixel 7 Pro"
                        variant="filled"
                        id="title"
                        name="title"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { border: "1px solid #D5D9E2", backgroundColor: "#fff", borderRadius: "7px" },
                          "& .MuiInputBase-root::before": { border: "none" },
                          "& .MuiInputBase-root:hover::before": { border: "none" },
                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <Box>
                    <FormControl fullWidth>
                      <Typography component="label" sx={{ fontWeight: "500", fontSize: "14px", mb: "10px", display: "block" }} className="text-black">
                        Description
                      </Typography>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Description"
                        rows={5}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: "6px",
                          padding: "10px 15px",
                          border: "1px solid #D5D9E2",
                        }}
                      ></textarea>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: "20px" }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: "20px" }}>{success}</Alert>}

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "10px", sm: "20px" }, mb: "25px" }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => router.back()}
              disabled={submitting}
              sx={{
                textTransform: "capitalize",
                borderRadius: "6px",
                fontWeight: "500",
                fontSize: { xs: "13px", sm: "16px" },
                padding: { xs: "10px 20px", sm: "10px 24px" },
                color: "#fff !important",
                boxShadow: "none",
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                textTransform: "capitalize",
                borderRadius: "6px",
                fontWeight: "500",
                fontSize: { xs: "13px", sm: "16px" },
                padding: { xs: "10px 20px", sm: "10px 24px" },
                color: "#fff !important",
                boxShadow: "none",
              }}
            >
              {submitting
                ? <><CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> Creating�</>
                : <><i className="material-symbols-outlined">add</i> Create Product</>}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CreateProduct;
