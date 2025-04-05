import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TelegramAnalytics from '@telegram-apps/analytics'

TelegramAnalytics.init({
    token: import.meta.env.VITE_ANALYTICS_TOKEN,
    appName: 'MemeBattleArena',
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
