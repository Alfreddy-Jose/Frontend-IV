import { Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dasbhoard from "@/pages/Dasbhoard";
import Users from "@/pages/usuario/Users";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Pnfs from "@/pages/pnf/Pnfs";
import Sedes from "@/pages/sede/Sedes";
import Inventario from "@/pages/inventario/Inventario";
import Lapso from "@/pages/lapso/Lapso";
import Matriculas from "@/pages/matricula/Matriculas";
import RolesPermisos from "@/pages/RolesPermisos.jsx/CrearRolesPermissions";
import Trayecto from "@/pages/trayecto/Trayecto";
import Personas from "@/pages/persona/Personas";
import Secciones from "@/pages/seccion/Secciones";
import UnidadCurricular from "@/pages/unidadCurricular/UnidadCurricular";
import Docentes from "@/pages/docente/Docentes";
import Coordinador from "@/pages/coordinador/Coordinador";
import GestionEntregasPage from "@/pages/gestionEntregas/GestionEntregasPage";

export function AppRoutes() {
  return (
    <Routes> 
      {/* Ruta del Login */}
      <Route path="/login" element={<Login />} />

      {/* Definiendo Rutas de la App */}
      <Route path="/" element={
        <ProtectedRoute>
        <Layout >
          <Dasbhoard />
        </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Usuarios  */}
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout >
            <Users />
          </Layout>
        </ProtectedRoute>
      } />

       {/* Rutas de Pnfs  */}
      <Route path="/pnfs" element={
        <ProtectedRoute>
          <Layout>
            <Pnfs />
          </Layout>
        </ProtectedRoute>
      } />
      
       {/* Rutas de Sedes  */}
      <Route path="/sedes" element={
        <ProtectedRoute>
          <Layout>
            <Sedes />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Lapso  */}
      <Route path="/lapsos" element={
        <ProtectedRoute>
          <Layout>
            <Lapso />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Lapso  */}
      <Route path="/matriculas" element={
        <ProtectedRoute>
          <Layout>
            <Matriculas />
          </Layout>
        </ProtectedRoute>
      } />

        {/* Rutas de Inventario  */}
      <Route path="/inventario" element={
        <ProtectedRoute>
          <Layout>
            <Inventario />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Roles y Permisos */}
      <Route path="/roles_permisos" element={
        <ProtectedRoute>
          <Layout>
            <RolesPermisos />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para trayectos */}
      <Route path="/trayectos" element={
        <ProtectedRoute>
          <Layout>
            <Trayecto />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Persona */}
      <Route path="/personas" element={
        <ProtectedRoute>
          <Layout>
            <Personas />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Docentes */}
      <Route path="/docentes" element={
        <ProtectedRoute>
          <Layout>
            <Docentes />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Coordinadores */}
      <Route path="/coordinadores" element={
        <ProtectedRoute>
          <Layout>
            <Coordinador />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rutas para Secciones */}
      <Route path="/secciones" element={
        <ProtectedRoute>
          <Layout>  
            <Secciones />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Unidad Curricular */}
      <Route path="/unidad_curricular" element={
        <ProtectedRoute>
          <Layout>  
            <UnidadCurricular />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Control de Entregas de Documentos */}
      <Route path="/gestion_entregas" element={
        <ProtectedRoute>
          <Layout>  
            <GestionEntregasPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta de unauthorized */}
      <Route path="/unauthorized" element={
          <h1>Unauthorized</h1>
      } />

      {/* Ruta 404*/}
      <Route path="*" element={
        <h1>404</h1>
      } />

    </Routes>
  );
}
