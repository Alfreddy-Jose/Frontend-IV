# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Consulta de lapsos cerrados

El sistema permite consultar información histórica de lapsos académicos cerrados en modo solo lectura.

- Al seleccionar un lapso cerrado en el selector del navbar, todos los módulos relacionados filtran por ese lapso.
- Un banner amarillo indica el modo consulta (`ReadOnlyBanner`).
- Los botones de crear/editar/eliminar se ocultan vía `<Guard blockOnReadOnly>`.
- El backend debe rechazar mutaciones en lapsos cerrados (validación de servidor, fuera del alcance de este cambio de frontend).

El estado del lapso se resuelve en `src/context/LapsoContext.jsx`, que carga el listado
completo (`getLapsos`) y expone `selectedLapso`, `isReadOnly` / `isHistorical` y
`setSelectedLapso`. El contexto sincroniza la selección con `AuthContext`
(`localStorage.lapsoActual`), de modo que el header `X-Lapso-Id` que inyecta
`src/services/api.jsx` apunta siempre al lapso visible.
