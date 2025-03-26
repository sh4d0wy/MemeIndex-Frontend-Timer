import './App.css'
import { Toaster } from 'react-hot-toast'

import Header from './Components/Header'
import ImageBg from './Components/ImageBg'
import Timer from './Components/Timer'
import BottomSection from './Components/BottomSection'
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#000000',
            borderRadius: '20px',
            fontSize: '12px',
            padding:'10px'
          },
          success: {
            duration: 3000,
            
          },
          error: {
            duration: 4000,
            
          },
        }}
      />
      <UserProvider>
        <div className='flex items-center flex-col max-h-screen bg-[#0165FF] w-screen'>        
            <ImageBg />
            <Header />
            <Timer />
            <BottomSection/>
        </div>
      </UserProvider>
    </>
  )
}

export default App
