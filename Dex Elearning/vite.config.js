import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


//configure Vite to proxy API requests to the backend server
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Adjust the target URL to your backend server
    },
  },
});
