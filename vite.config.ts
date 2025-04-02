import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'

dotenv.config()

// https://vite.dev/config/ 
export default defineConfig({
  plugins: [ tailwindcss(),react()],

  define: {
    'import.meta.env.VITE_BOT_TOKEN': JSON.stringify(process.env.VITE_BOT_TOKEN),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL)
  }
 
})
