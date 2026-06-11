import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReceptionPage } from './pages/Reception'
import { LoginPage } from './pages/Login'
import { DashboardPage } from './pages/Dashboard'
import { PrivateRoute } from './components/PrivateRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<ReceptionPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
