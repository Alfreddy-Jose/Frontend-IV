import { Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dasbhoard from "@/pages/Dasbhoard";
import Users from "@/pages/usuario/Users";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Pnfs from "@/pages/pnf/Pnfs";
import Sedes from "@/pages/sede/Sedes";
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
import NotFoundPage from "@/pages/NotFoundPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import ConfiguracionPNF from "@/pages/configuracionPNF/ConfiguracionPNF";
import Proyecciones from "@/pages/proyeccion/Proyecciones";
import AnosAcademicos from "@/pages/anoAcademico/AnosAcademicos";
import Censos from "@/pages/censo/Censos";
import Voceros from "@/pages/vocero/Voceros";
import Inventario from "@/pages/inventario/InventarioList";
import Bitacora from "@/pages/bitacora/Bitacora";
import Per from "@/pages/per/Per";
import EstadisticaInscripcion from "@/pages/estadisticaInscripcion/estadisticaInscripcion";
import { EditProfile } from "@/pages/usuario/EditProfile";

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
        <ProtectedRoute requiredPermission="usuario.ver">
          <Layout >
            <Users />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta para editar perfil */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <EditProfile />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Pnfs  */}
      <Route path="/pnfs" element={
        <ProtectedRoute requiredPermission="pnf.ver">
          <Layout>
            <Pnfs />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Parámetros PNF */}
      <Route path="/configuraciones_pnf" element={
        <ProtectedRoute requiredPermission="parametro.ver">
          <Layout>
            <ConfiguracionPNF />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Proyecciones Académicas */}
      <Route path="/proyecciones" element={
        <ProtectedRoute /* requiredPermission="proyeccion.ver" */>
          <Layout>
            <Proyecciones />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Sedes  */}
      <Route path="/sedes" element={
        <ProtectedRoute requiredPermission="sede.ver">
          <Layout>
            <Sedes />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Lapso  */}
      <Route path="/lapsos" element={
        <ProtectedRoute requiredPermission="lapso.ver">
          <Layout>
            <Lapso />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Años Académicos */}
      <Route path="/anos_academicos" element={
        <ProtectedRoute requiredPermission="anoAcademico.ver">
          <Layout>
            <AnosAcademicos />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Lapso  */}
      <Route path="/matriculas" element={
        <ProtectedRoute requiredPermission="Tipo Matricula.ver">
          <Layout>
            <Matriculas />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Inventario  */}
      <Route path="/inventario" element={
        <ProtectedRoute requiredPermission="inventario.ver">
          <Layout>
            <Inventario />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de Bitácora de Auditoría */}
      <Route path="/bitacora" element={
        <ProtectedRoute>
          <Layout>
            <Bitacora />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Roles y Permisos */}
      <Route path="/roles_permisos" element={
        <ProtectedRoute requiredPermission="rol.ver">
          <Layout>
            <RolesPermisos />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para trayectos */}
      <Route path="/trayectos" element={
        <ProtectedRoute requiredPermission="trayecto.ver">
          <Layout>
            <Trayecto />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Persona */}
      <Route path="/personas" element={
        <ProtectedRoute requiredPermission="persona.ver">
          <Layout>
            <Personas />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Docentes */}
      <Route path="/docentes" element={
        <ProtectedRoute requiredPermission="docente.ver">
          <Layout>
            <Docentes />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Coordinadores */}
      <Route path="/coordinadores" element={
        <ProtectedRoute requiredPermission="coordinador.ver">
          <Layout>
            <Coordinador />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Voceros */}
      <Route path="/voceros" element={
        <ProtectedRoute requiredPermission="vocero.ver">
          <Layout>
            <Voceros />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Secciones */}
      <Route path="/secciones" element={
        <ProtectedRoute requiredPermission="seccion.ver">
          <Layout>
            <Secciones />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para Unidad Curricular */}
      <Route path="/unidad_curricular" element={
        <ProtectedRoute requiredPermission="unidad Curricular.ver">
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

      {/* Rutas para el censo estudiantil */}
      <Route path="/censo_estudiantil" element={
        <ProtectedRoute>
          <Layout>
            <Censos />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para el Estadistica de inscripción */}
      <Route path="/estadistica_inscripcion" element={
        <ProtectedRoute>
          <Layout>
            <EstadisticaInscripcion />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para el PER */}
      <Route path="/per" element={
        <ProtectedRoute>
          <Layout>
            <Per />
          </Layout>
        </ProtectedRoute>
      } />


      {/* Ruta de unauthorized */}
      <Route path="/unauthorized" element={
        <UnauthorizedPage />
      } />

      {/* Ruta 404*/}
      <Route path="*" element={
        <NotFoundPage />
      } />

    </Routes>
  );
}
