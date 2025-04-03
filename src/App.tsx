import './App.css'
import { Toaster } from 'react-hot-toast'

import Header from './Components/Header'
import ImageBg from './Components/ImageBg'
import Timer from './Components/Timer'
import BottomSection from './Components/BottomSection'
import TaskComponent from './Components/TaskComponent'
import { UserProvider } from './context/UserContext'
import { TaskProvider } from './context/TaskContext'

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#ffffff',
            color: '#0165FF',
            borderRadius: '12px',
            fontSize: '12px',
            padding:'5px',
            fontWeight:'bold'
          },
          success: {
            duration: 2000,
          },
          error: {
            duration: 2000,
          },
        }}
      />
      <UserProvider>
        <TaskProvider>
          <div className='flex items-center flex-col max-h-screen bg-[#0165FF] w-screen'>        
            <ImageBg />
            <Header />
            <Timer />
            <TaskComponent />
            <BottomSection/>
          </div>
        </TaskProvider>
      </UserProvider>
    </>
  )
}

export default App
