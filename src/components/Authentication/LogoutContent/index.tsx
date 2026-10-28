"use client";

import { authApi, AuthUser } from "@/lib/api/auth";
import { Box, Button, Grid, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const LogoutContent: React.FC = () => {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    authApi.me().then((u) => {
      setUser(u);
      authApi.logout();
    });
  }, []);

  return (
    <>
      <Box
        className="auth-main-wrapper forgot-password-area"
        sx={{
          py: { xs: "60px", md: "80px", lg: "100px", xl: "135px" },
        }}
      >
        <Box
          sx={{
            maxWidth: { sm: "500px", md: "1255px" },
            mx: "auto !important",
            px: "12px",
          }}
        >
          <Grid
            container
            alignItems="center"
            columnSpacing={{ xs: 1, sm: 2, md: 4, lg: 3 }}
          >
            <Grid item xs={12} md={6} lg={6} xl={7}>
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                }}
              >
                <Image
                  src="/images/logout.jpg"
                  alt="logout"
                  width={646}
                  height={804}
                  style={{
                    borderRadius: "24px",
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={6} xl={5}>
              <Box
                className="form-content"
                sx={{
                  paddingLeft: { xs: "0", lg: "10px" },
                }}
              >
                <Box
                  className="logo"
                  sx={{
                    mb: "23px",
                  }}
                >
                  <Image
                    src="/images/logo-big.svg"
                    alt="logo"
                    width={142}
                    height={38}
                  />
                  <Image
                    src="/images/white-logo.svg"
                    className="d-none"
                    alt="logo"
                    width={142}
                    height={38}
                  />
                </Box>

                <Box
                  className="title"
                  sx={{
                    mb: "23px",
                  }}
                >
                  <Typography
                    variant="h1"
                    className="text-black"
                    sx={{
                      fontSize: { xs: "22px", sm: "25px", lg: "28px" },
                      mb: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Welcome back to Kenlivo!
                  </Typography>

                  <Typography sx={{ fontWeight: "500", fontSize: "16px" }}>
                    You Are Logged out
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    mb: "20px",
                  }}
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      className="rounded-circle"
                      alt={user.name}
                      width={50}
                      height={50}
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </Box>
                  )}
                  <Box>
                    <Typography
                      component="span"
                      className="text-black"
                      sx={{ fontWeight: "600", display: "block" }}
                    >
                      {user?.name || "—"}
                    </Typography>
                    {user?.email && (
                      <Typography sx={{ fontSize: "13px", color: "#888" }}>
                        {user.email}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Link href="/authentication/sign-in">
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: "capitalize",
                      borderRadius: "6px",
                      fontWeight: "500",
                      fontSize: { xs: "13px", sm: "16px" },
                      padding: { xs: "10px 20px", sm: "10px 24px" },
                      color: "#fff !important",
                      boxShadow: "none",
                      width: "100%",
                    }}
                  >
                    <i className="material-symbols-outlined mr-5">autorenew</i>
                    Sign In
                  </Button>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default LogoutContent;
