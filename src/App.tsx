import './App.css'

import Header from './Components/Header'
import ImageBg from './Components/ImageBg'
import Timer from './Components/Timer'
import BottomSection from './Components/BottomSection'
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <UserProvider>
      <div className='flex items-center flex-col max-h-screen bg-[#0165FF] w-screen'>        
          <ImageBg />
          <Header />
          <Timer />
          <BottomSection/>
      </div>
    </UserProvider>
  )
}

export default App
