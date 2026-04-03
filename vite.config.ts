import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-gsap': ['gsap', '@gsap/react', 'gsap/ScrollTrigger', 'gsap/ScrollToPlugin'],
          'vendor-recharts': ['recharts'],
          'vendor-ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
});
