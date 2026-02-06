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
        cookieDomainRewrite: "localhost"
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
