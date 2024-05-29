This is now deployed on vercel https://election-sentiment-analysis.vercel.app/.
# Config
1. Run the project
Run the backend and then run `pnpm run dev` under the `dashboard` folder. If running for the first time, run `pnpm install` to install packages.

2. `.env` files
The backend is also deployed on vercel so we need to set the `VITE_BACKEND_URL` for develpment and production environments.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

