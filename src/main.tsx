import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TelegramAnalytics from '@telegram-apps/analytics'

TelegramAnalytics.init({
    token: 'eyJhcHBfbmFtZSI6Ik1lbWVCYXR0bGVBcmVuYSIsImFwcF91cmwiOiJodHRwczovL3QubWUvTWVtZUJhdHRsZUFyZW5hQm90IiwiYXBwX2RvbWFpbiI6Imh0dHBzOi8vYXJlbmEubWlkZXguaW8vIn0=!qm7E5V4l3SplbE6Zkyx/rioXQ2EUE8aUeM5EuhYBNbo=',
    appName: 'MemeBattleArena',
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
