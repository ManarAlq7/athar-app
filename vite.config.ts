import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // منفذ ثابت خاص بأثر: هلا على 3100، وأثر هنا، فيعملان معاً بلا تعارض.
    // strictPort يمنع القفز إلى منفذ آخر بصمت لو كان هذا مشغولاً.
    port: 5180,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        // فصل المكتبات الكبيرة حتى لا تُعاد تنزيلها مع كل تحديث للكود
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
