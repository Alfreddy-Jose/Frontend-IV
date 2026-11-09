import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes/Routes";
import { ThemeProvider } from "./components/ui/theme-provider";
import { AuthProvider } from "./context/AuthContext";
import TitleManager from "./components/layout/TitleManager";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          {/* Gestión global del título de la pestaña del navegador */}
          <TitleManager />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}