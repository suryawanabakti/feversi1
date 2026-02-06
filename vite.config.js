import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/(api|sanctum|logout|storage)': {
        target: 'https://datapppds2.med.unhas.ac.id',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "datapppds2.med.unhas.ac.id"
      },
      '/login': {
        target: 'https://datapppds2.med.unhas.ac.id',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "datapppds2.med.unhas.ac.id",
        bypass: (req) => {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      sass: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent', 'if-function']
      }
    }
  }
})
