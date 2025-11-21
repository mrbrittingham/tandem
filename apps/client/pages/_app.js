import React from "react";
import { ThemeProvider, windmillCreekTheme } from "@tandem/ui-kit";
import { FloatingChatWidget } from "../components/widget/FloatingChatWidget";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={windmillCreekTheme}>
      <Component {...pageProps} />
      {/* Floating widget with trigger + unread badge behavior */}
      <FloatingChatWidget restaurantId={pageProps?.restaurantId} />
    </ThemeProvider>
  );
}
