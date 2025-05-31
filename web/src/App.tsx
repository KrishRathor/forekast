import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/global/Navbar'
import { DashboardPage } from './pages/DashboardPage'
import { MarketsPage } from './pages/MarketsPage'
import { TradesPage } from './pages/TradesPage'
import { LandingPage } from './pages/LandingPage'

function App() {


  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/markets' element={<MarketsPage />} />
          <Route path='/trade' element={<TradesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
