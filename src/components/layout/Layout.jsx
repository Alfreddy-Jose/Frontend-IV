import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/context/SidebarContext";

export default function Layout({ children }) {
  return (
    <>
      <SidebarProvider>
        <Navbar />
        <Toaster
          position="top-right"
          gutter={12} // Espacio entre múltiples alertas
          containerStyle={{
            top: 40, // Esto es lo que bajará la alerta
            left: 20,
            bottom: 20,
            right: 20,
          }}
          toastOptions={{
            // Estilos por defecto para toasts simples
            className: "",
            style: {
              background: "#1e293b",
              color: "#fff",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
          }}
        />
        <div className="flex overflow-hidden bg-white pt-16 dark:bg-[#020617]">
          <Sidebar />
          <div
            id="main-content"
            className="h-full w-full bg-gray-50 relative overflow-y-auto lg:ml-64 dark:bg-[#020617] dark:border-slate-800/50 dark:opacity-80"
          >
            <main>
              <div className="pt-6 px-4">
                <div className="w-full min-h-[calc(100vh-230px)]">
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 dark:bg-slate-900">
                    {children}
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
