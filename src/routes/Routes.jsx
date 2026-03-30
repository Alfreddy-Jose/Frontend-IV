import { Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dasbhoard from "@/pages/Dasbhoard";
import Users from "@/pages/usuario/Users";
import Roles from "@/pages/rol/Roles";
import Login from "@/pages/Login";

export function AppRoutes() {
  return (
    <Routes>
      {/* Ruta del Login */}
      <Route path="/login" element={<Login />} />

      {/* Definiendo Rutas de la App */}
      <Route path="/" element={<Layout >
        <Dasbhoard />
      </Layout>} />

      {/* Rutas de Usuarios  */}
      <Route path="/users" element={<Layout >
        <Users />
      </Layout>} />

      {/* Rutas de Roles  */}
      <Route path="/roles" element={<Layout>
        <Roles />
      </Layout>} />
    </Routes>
  );
}
