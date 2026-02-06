import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/(api|sanctum|login|logout|storage)': {
        target: 'http://bankdatapppds.test',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "bankdatapppds.test",
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
