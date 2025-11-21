export const windmillCreekTheme = {
  name: "Windmill Creek",
  widgetIcon: "Amber-Rise",
  branding: {
    brandName: "Windmill Creek",
    heroImage: null,
    flowerLogo: null,
    // Windmill Creek text logo filename; ui surfaces prepend /assets/logos/.
    textLogo: "wmc-text.png",
    chatTitle: "Windmill Creek Chat",
  },
  colors: {
    primary: "#5C2E4A",
    secondary: "#D4598B",
    accent: "#D9A441",
    background: "#F5EFE7",
    surface: "#FAF7F2",
    userBubble: "#F9EDD5",
    agentBubble: "#FAF7F2",
    highlight: "#8B4F7D",
  },
  gradients: {
    cta: "linear-gradient(90deg, #5C2E4A, #D4598B)",
  },
  shadows: {
    soft: "0 3px 8px rgba(61,40,23,0.12)",
    deep: "0 8px 20px rgba(61,40,23,0.18)",
    rich: "0 4px 12px rgba(92,46,74,0.15)",
  },
  radii: {
    widget: "16px",
    bubble: "18px",
    button: "9999px",
  },
  typography: {
    header: "Lilita One",
    body: "Inter",
  },
  icons: {
    sendArrow: "#D9A441",
    headerIcons: "#FFFFFF",
  },
} as const;
