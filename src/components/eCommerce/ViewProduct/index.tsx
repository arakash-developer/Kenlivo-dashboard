"use client";

import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  tagline?: string;
  price: number;
  finalPrice?: number;
  discountPercentage?: number;
  stock: number;
  rating?: number;
  numReviews?: number;
  isActive: boolean;
  categoryName?: string;
  images?: string[];
  vendor?: string;
  collection?: string;
  brand?: string;
  productType?: string;
  createdAt?: string;
}

interface ViewProductProps {
  id: string;
}

const ViewProduct: React.FC<ViewProductProps> = ({ id }) => {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((j) => { if (j.data) setProduct(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Card sx={{ boxShadow: "none", borderRadius: "7px", p: 4, textAlign: "center" }} className="rmui-card">
        <Typography color="error">Product not found.</Typography>
        <Button onClick={() => router.push("/ecommerce/products-list/")} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Card>
    );
  }

  const images = (product.images ?? []).filter(Boolean);
  const finalPrice = product.finalPrice ?? (product.discountPercentage ? product.price * (1 - product.discountPercentage / 100) : product.price);

  return (
    <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }} rowSpacing={3}>
      {/* Images panel */}
      <Grid item xs={12} md={5}>
        <Card sx={{ boxShadow: "none", borderRadius: "7px", p: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
          {images.length > 0 ? (
            <>
              <Box sx={{ borderRadius: "10px", overflow: "hidden", mb: 2, bgcolor: "#f6f7f9", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  width={400}
                  height={300}
                  style={{ objectFit: "contain", maxHeight: 300, width: "100%", borderRadius: "10px" }}
                  unoptimized
                />
              </Box>
              {images.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      sx={{
                        width: 64, height: 64, borderRadius: "8px", overflow: "hidden", cursor: "pointer",
                        border: selectedImage === i ? "2px solid" : "2px solid transparent",
                        borderColor: selectedImage === i ? "primary.main" : "transparent",
                        bgcolor: "#f6f7f9", flexShrink: 0,
                      }}
                    >
                      <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ borderRadius: "10px", bgcolor: "#f6f7f9", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
              <i className="material-symbols-outlined" style={{ fontSize: 72, color: "#ccc" }}>image</i>
            </Box>
          )}
        </Card>
      </Grid>

      {/* Details panel */}
      <Grid item xs={12} md={7}>
        <Card sx={{ boxShadow: "none", borderRadius: "7px", p: { xs: "18px", sm: "20px", lg: "25px" } }} className="rmui-card">
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography variant="h5" fontWeight={700} fontSize={{ xs: "18px", md: "22px" }} className="text-black">
              {product.name}
            </Typography>
            <Chip
              label={product.isActive ? "Active" : "Inactive"}
              size="small"
              sx={{
                bgcolor: product.isActive ? "#eeffe5" : "#fef2f2",
                color: product.isActive ? "#22c55e" : "#ef4444",
                fontWeight: 600, fontSize: "12px", flexShrink: 0,
              }}
            />
          </Box>

          {product.tagline && (
            <Typography sx={{ fontSize: "14px", color: "#666", mb: 2, fontStyle: "italic" }}>
              {product.tagline}
            </Typography>
          )}

          {/* Rating */}
          {product.rating ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="ri-star-fill" style={{ fontSize: "16px", color: star <= Math.round(product.rating!) ? "#ffc107" : "#e2e8f0" }} />
              ))}
              <Typography sx={{ fontSize: "13px", color: "#888" }}>({product.numReviews ?? 0} reviews)</Typography>
            </Box>
          ) : null}

          {/* Pricing */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px", mb: 3 }}>
            <Typography fontWeight={700} fontSize="24px" className="text-black">
              ${finalPrice.toFixed(2)}
            </Typography>
            {product.discountPercentage ? (
              <>
                <Typography sx={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through" }}>
                  ${product.price.toFixed(2)}
                </Typography>
                <Chip label={`${product.discountPercentage}% OFF`} size="small" sx={{ bgcolor: "#fff3e0", color: "#f57c00", fontWeight: 600 }} />
              </>
            ) : null}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Meta grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Category", value: product.categoryName || "—" },
              { label: "Stock", value: product.stock > 0 ? `${product.stock} units` : "Out of stock", color: product.stock > 0 ? undefined : "#ef4444" },
              { label: "Brand", value: product.brand || "—" },
              { label: "Vendor", value: product.vendor || "—" },
              { label: "Collection", value: product.collection || "—" },
              { label: "Product Type", value: product.productType || "—" },
            ].map(({ label, value, color }) => (
              <Grid item xs={6} key={label}>
                <Typography sx={{ fontSize: "12px", color: "#888", mb: "2px" }}>{label}</Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 500, color: color ?? "inherit" }} className={color ? "" : "text-black"}>{value}</Typography>
              </Grid>
            ))}
          </Grid>

          {product.description && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography sx={{ fontSize: "13px", color: "#888", mb: "6px", fontWeight: 600 }}>Description</Typography>
              <Typography sx={{ fontSize: "14px", lineHeight: 1.7, color: "#555", whiteSpace: "pre-wrap" }}>
                {product.description}
              </Typography>
            </>
          )}

          {product.createdAt && (
            <Typography sx={{ fontSize: "12px", color: "#aaa", mt: 3 }}>
              Added {new Date(product.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: "10px", mt: 3 }}>
            <Link href={`/ecommerce/edit-product/${product._id}/`}>
              <Button
                variant="contained"
                sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: 500, fontSize: "14px", padding: "10px 24px", color: "#fff !important" }}
              >
                <i className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>edit</i>
                Edit Product
              </Button>
            </Link>
            <Button
              variant="outlined"
              onClick={() => router.push("/ecommerce/products-list/")}
              sx={{ textTransform: "capitalize", borderRadius: "8px", fontWeight: 500, fontSize: "14px", padding: "10px 24px" }}
            >
              Back to List
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ViewProduct;
