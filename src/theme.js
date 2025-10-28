import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0B5FFF" },
    background: { default: "#f7f8fa", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "Inter, SF Pro Text, system-ui, Roboto, sans-serif",
  },
});

export default theme;
