import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // keep the animation engine and React in their own long-cacheable chunks
        manualChunks(id: string) {
          if (/node_modules\/(gsap|@gsap|lenis)\//.test(id)) return 'motion'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
        },
      },
    },
  },
})
