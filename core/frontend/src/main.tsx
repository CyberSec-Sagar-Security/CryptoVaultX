
import { createRoot } from "react-dom/client";
import AppRouter from "./router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </ThemeProvider>
);