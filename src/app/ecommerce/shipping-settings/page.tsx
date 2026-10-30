"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";

interface ShippingFees {
  insideKurigram: number;
  outsideKurigram: number;
}

export default function ShippingSettingsPage() {
  const [fees, setFees] = React.useState<ShippingFees>({
    insideKurigram: 60,
    outsideKurigram: 100,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch("/api/shipping-settings/")
      .then(async (response) => {
        const result = (await response.json()) as {
          success: boolean;
          message?: string;
          data?: ShippingFees;
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Could not load delivery charges.");
        }
        return result.data;
      })
      .then((data) => {
        if (active) setFees(data);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Could not load delivery charges.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveFees = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/shipping-settings/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fees),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: ShippingFees;
      };
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Could not save delivery charges.");
      }
      setFees(result.data);
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save delivery charges.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="breadcrumb-card">
        <h5>Delivery Charges</h5>
        <ul className="breadcrumb">
          <li>
            <NextLink href="/dashboard/ecommerce/">
              <i className="material-symbols-outlined">home</i>
              Dashboard
            </NextLink>
          </li>
          <li>eCommerce</li>
          <li>Delivery Charges</li>
        </ul>
      </div>

      <Card sx={{ width: "100%", p: { xs: 2, sm: 3 }, boxShadow: "none" }} className="rmui-card">
        <Typography variant="h6" sx={{ mb: 1 }}>
          Kurigram delivery rates
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Customers in Kurigram district are charged the inside rate. All other
          districts use the outside rate.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Delivery charges saved.</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={saveFees}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <TextField
              label="Inside Kurigram charge (৳)"
              type="number"
              value={fees.insideKurigram}
              onChange={(event) =>
                setFees((current) => ({
                  ...current,
                  insideKurigram: Number(event.target.value),
                }))
              }
              inputProps={{ min: 0, step: 1 }}
              required
            />
            <TextField
              label="Outside Kurigram charge (৳)"
              type="number"
              value={fees.outsideKurigram}
              onChange={(event) =>
                setFees((current) => ({
                  ...current,
                  outsideKurigram: Number(event.target.value),
                }))
              }
              inputProps={{ min: 0, step: 1 }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
            >
              {saving ? "Saving..." : "Save delivery charges"}
            </Button>
          </Box>
        )}
      </Card>
    </>
  );
}
