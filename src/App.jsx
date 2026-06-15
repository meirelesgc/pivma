import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReceptionPage } from './pages/Reception'
import { LoginPage } from './pages/Login'
import { WorkspacePage } from './pages/Workspace'
import { MethodDetailsPage } from './pages/MethodDetails'
import { TasksPage } from './pages/Tasks'
import { PrivateRoute } from './components/PrivateRoute'
import { BaseLayout } from './components/BaseLayout'

function App() {
  return <BrowserRouter>
    <Routes>
      <Route element={<BaseLayout />}>
        {/* Rotas Públicas */}
        <Route path="/" element={<ReceptionPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/workspace/method/:id" element={<MethodDetailsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Route>
      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
}

export default App
