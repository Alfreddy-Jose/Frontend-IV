import React from "react";
import BackgroundImg from "@/assets/UPTYAB.webp";
import LogoImg from "@/assets/Logo.png";
import {
  Mail,
  LockIcon,
  Eye,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { getCsrfToken, login } from "@/services/authService";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePasswordToggle } from "@/hooks/usePasswordToggle";
import { notify } from "@/components/shared/Notify";
import { Toaster } from "react-hot-toast";

function Login() {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [passwordType, togglePassword] = usePasswordToggle();

  // lockout countdown state in seconds
  const [lockoutTime, setLockoutTime] = React.useState(() => {
    const savedTime = localStorage.getItem("loginLockoutExpiration");
    if (savedTime) {
      const remaining = Math.ceil((new Date(savedTime).getTime() - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  // Countdown timer effect
  React.useEffect(() => {
    if (lockoutTime <= 0) return;

    const timer = setInterval(() => {
      setLockoutTime((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem("loginLockoutExpiration");
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      // 1. Intentar obtener el Token CSRF
      await getCsrfToken();

      // 2. Enviar credenciales
      const response = await login(values);

      // Si la autenticación es exitosa, guardar el usuario y redirigir
      if (response.status >= 200 && response.status < 300) {
        // 3. Iniciar sesión en el contexto
        signIn(response.data);

        // 4. Redirección
        navigate(from, {
          replace: true,
          // state: { message: response.data.message },
        });
      }
    } catch (err) {
      // Manejar el error de autenticación
      const status = err.response?.status;
      if (status === 401) {
        notify.error("Credenciales incorrectas");
      } else if (status === 429) {
        notify.error(err.response?.data?.message || "Demasiados intentos. Inténtalo de nuevo más tarde.");
        const retryAfterHeader = err.response?.headers?.["retry-after"] || err.response?.headers?.["Retry-After"];
        let seconds = 60;
        if (retryAfterHeader) {
          seconds = parseInt(retryAfterHeader, 10);
        } else if (err.response?.data?.message) {
          const match = err.response.data.message.match(/\d+/);
          if (match) {
            seconds = parseInt(match[0], 10);
          }
        }
        setLockoutTime(seconds);
        const expirationTime = new Date(Date.now() + seconds * 1000).toISOString();
        localStorage.setItem("loginLockoutExpiration", expirationTime);
      } else {
        console.error("Error inesperado:", err);
        notify.error("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      // Es vital asegurar que el estado de carga se detenga
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit,
  });

  return (
    <main className="min-h-screen flex items-center justify-between font-sans transition-colors duration-300 relative">
      {/* Fondo de pantalla */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <Toaster
        position="top-right"
        gutter={12} // Espacio entre múltiples alertas
        containerStyle={{
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

      {/* Lado izquierdo: Logo */}
      <div className="relative z-10 hidden lg:flex flex-1 items-center justify-center p-8">
        <img src={LogoImg} alt="Logotipo" className="max-w-[80%] xl:max-w-[600px] h-auto drop-shadow-2xl rounded-3xl" />
      </div>

      {/* Lado derecho: Formulario */}
      <div className="relative z-10 w-full lg:w-auto flex justify-center items-center p-4 lg:pr-12 xl:pr-32">
        <div className="w-full max-w-[440px]">
          {/* Login Card Container */}
          <div className="bg-white/70 dark:bg-[#070B13]/70 backdrop-blur-md rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden p-10 border border-white/30 dark:border-[#1A2231]/50">
            {/* Top Icon / Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-[#1A2231] rounded-xl flex items-center justify-center text-indigo-600 dark:text-[#7A8FFB]">
                <LockIcon size={24} fill="currentColor" fillOpacity={0.2} />
              </div>
            </div>

            {/* Card Header */}
            <div className="text-center mb-10">
              <h1 className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Bienvenido!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Por favor, introduce tus datos de acceso para acceder al panel.
              </p>
            </div>

            {/* Form */}
            <form
              className="space-y-6"
              onKeyDown={(e) => e.key === "Enter" && lockoutTime === 0 && formik.handleSubmit()}
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${lockoutTime > 0 ? "text-red-400 dark:text-red-500" : "text-slate-400 dark:text-slate-500"
                      }`}
                    size={18}
                  />
                  <input
                    className={`w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0B101B] border rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100 ${lockoutTime > 0
                      ? "border-red-500 dark:border-red-500 focus:ring-4 focus:ring-red-50 dark:focus:ring-red-950/20 focus:border-red-500"
                      : "border-slate-200 dark:border-[#1A2231] focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950 focus:border-indigo-500 dark:focus:border-indigo-700"
                      }`}
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    autoComplete="off"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    disabled={lockoutTime > 0}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <LockIcon
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${lockoutTime > 0 ? "text-red-400 dark:text-red-500" : "text-slate-400 dark:text-slate-500"
                      }`}
                    size={18}
                  />
                  <input
                    className={`w-full pl-11 pr-12 py-3.5 bg-white dark:bg-[#0B101B] border rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100 ${lockoutTime > 0
                      ? "border-red-500 dark:border-red-500 focus:ring-4 focus:ring-red-50 dark:focus:ring-red-950/20 focus:border-red-500"
                      : "border-slate-200 dark:border-[#1A2231] focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950 focus:border-indigo-500 dark:focus:border-indigo-700"
                      }`}
                    type={passwordType}
                    name="password"
                    placeholder="••••••••"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    disabled={lockoutTime > 0}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword()}
                    disabled={lockoutTime > 0}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                  >
                    <Eye size={18} />
                  </button>
                </div>
                {lockoutTime > 0 && (
                  <div className="text-[12px] font-semibold text-red-500 dark:text-red-400 mt-2 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 min-w-[6px] rounded-full bg-red-500 dark:bg-red-400 inline-block"></span>
                    <span>Inténtalo de nuevo en {lockoutTime} segundos.</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={formik.handleSubmit} // 👈 Agrega el click manual
                disabled={formik.isSubmitting || lockoutTime > 0}
                className={`w-full py-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group ${lockoutTime > 0
                  ? "bg-red-500/20 dark:bg-red-500/10 text-red-500/50 dark:text-red-400/50 border border-red-500/30 dark:border-red-500/20 cursor-not-allowed shadow-none"
                  : "bg-[#4338ca] dark:bg-[#5865F2] hover:bg-[#3730a3] dark:hover:bg-[#4752C4] shadow-lg shadow-indigo-200 dark:shadow-none"
                  }`}
              >
                <span>{lockoutTime > 0 ? "Bloqueado temporalmente" : "Iniciar sesión"}</span>
                {/* mostrar icono de carga mientras se procesa el login */}
                {formik.isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : lockoutTime > 0 ? (
                  <LockIcon size={18} />
                ) : (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-slate-200 dark:text-slate-300 text-[11px] font-medium drop-shadow-md">
              <ShieldCheck size={14} />
              <span>Protegida por encriptación SSL de 256 bits</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
