import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';

const SuccessToast = ({ message, t }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full ${isDark ? 'bg-[#0f172a]' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-gray-200'} shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {/* Círculo verde sutil */}
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Acción completada
            </p>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className={`flex border-l ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className={`w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50' : 'text-indigo-600 hover:text-indigo-500 hover:bg-gray-100'} transition-colors focus:outline-none`}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const ErrorToast = ({ message, t }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full ${isDark ? 'bg-[#0f172a]' : 'bg-white'} border ${isDark ? 'border-red-700' : 'border-red-300'} shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Error
            </p>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className={`flex border-l ${isDark ? 'border-red-700' : 'border-red-300'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const toastId = t?.id ?? t;
            toast.dismiss(toastId);
          }}
          aria-label="Cerrar notificación"
          className={`w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-slate-800/50' : 'text-red-600 hover:text-red-500 hover:bg-gray-100'} transition-colors focus:outline-none`}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export const notify = {
  success: (message) =>
    toast.custom((t) => <SuccessToast message={message} t={t} />),

  error: (message) =>
    toast.custom((t) => <ErrorToast message={message} t={t} />),
};