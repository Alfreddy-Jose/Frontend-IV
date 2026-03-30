import React from "react";
import { Mail, LockIcon, Eye, ArrowRight, ShieldCheck } from "lucide-react";

function Login() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0B101B] flex flex-col items-center justify-center px-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-[440px]">
        {/* Login Card Container */}
        <div className="bg-white dark:bg-[#070B13] rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden p-10 border dark:border-[#1A2231]">
          
          {/* Top Icon / Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-[#1A2231] rounded-xl flex items-center justify-center text-indigo-600 dark:text-[#7A8FFB]">
              <LockIcon size={24} fill="currentColor" fillOpacity={0.2} />
            </div>
          </div>

          {/* Card Header */}
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Por favor, introduce tus datos de acceso para acceder al panel.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-[#1A2231] rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950 focus:border-indigo-500 dark:focus:border-indigo-700 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100"
                  type="email"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contraseña
                </label>
                <a href="#" className="text-[11px] font-bold text-indigo-600 dark:text-[#7A8FFB] hover:text-indigo-700 dark:hover:text-[#99A8FF]">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-[#1A2231] rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950 focus:border-indigo-500 dark:focus:border-indigo-700 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-slate-100"
                  type="password"
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 ml-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-[#1A2231] bg-white dark:bg-[#0B101B] text-indigo-600 dark:text-[#5865F2] focus:ring-indigo-500 dark:focus:ring-offset-[#070B13] cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Recordarme durante 30 días
              </label>
            </div>

            {/* Submit Button */}
            <button className="w-full py-4 bg-[#4338ca] dark:bg-[#5865F2] hover:bg-[#3730a3] dark:hover:bg-[#4752C4] text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group">
              <span>Iniciar sesión</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-6">          
          <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 text-[11px] font-medium">
            <ShieldCheck size={14} />
            <span>Protegida por encriptación SSL de 256 bits</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;