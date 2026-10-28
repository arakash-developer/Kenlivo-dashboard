import "remixicon/fonts/remixicon.css";
import "swiper/css";
import "swiper/css/bundle";
import "../../node_modules/boxicons/css/boxicons.min.css";
import "../../styles/control-panel.css";
import "../../styles/crypto-dashboard.css";
import "../../styles/front-pages.css";
import "../../styles/globals.css";
import "../../styles/left-sidebar-menu.css";
import "../../styles/top-navbar.css";
// globals dark Mode CSS
import "../../styles/dark.css";
// globals RTL Mode CSS
import "../../styles/rtl.css";

import LayoutProvider from "@/providers/LayoutProvider";
import theme from "@/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as React from "react";

export const metadata = {
  title: "Kenlivo - React Nextjs 14+ Material Design Admin Dashboard Template",
  description: "React Nextjs 14+ Material Design Admin Dashboard Template",
  icons: {
    icon: "/images/logo-icon.svg",
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />

            <LayoutProvider>{props.children}</LayoutProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
