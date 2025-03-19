import './App.css'
// import { THEME,  TonConnectButton,  TonConnectUIProvider } from '@tonconnect/ui-react'
import Header from './Components/Header'
import ImageBg from './Components/ImageBg'
import Timer from './Components/Timer'
import BottomSection from './Components/BottomSection'
import React from 'react'
// import ConnectButton from './Components/ConnectButton'

function App() {
  return (
   <>

      <div className='flex items-center flex-col max-h-screen bg-[#0165FF] w-screen'>        
          <ImageBg />
          <Header />
          <Timer />
          <BottomSection/>
          {/* <ConnectButton/> */}
      </div>

   </>
  )
}

export default App
