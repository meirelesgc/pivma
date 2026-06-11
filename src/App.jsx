import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { ReceptionPage } from './pages/Reception'
import { LoginPage } from './pages/Login'
import { WorkspacePage } from './pages/Workspace'
import { NewSubmissionPage } from './pages/NewSubmission'
import { ProcessDetailsPage } from './pages/ProcessDetails'
import { PrivateRoute } from './components/PrivateRoute'
import { MainLayout } from './components/MainLayout'
import './App.css'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'rgb(0, 156, 59)',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          fontWeightStrong: 400,
        },
        components: {
          Typography: {
            fontFamilyCode: "'Instrument Serif', serif",
            fontWeightStrong: 400,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 32,
            fontWeight: 400,
          },
          Card: {
            borderRadiusLG: 12,
          }
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Rotas Públicas */}
            <Route path="/" element={<ReceptionPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas Privadas */}
            <Route element={<PrivateRoute />}>
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/workspace/new-submission" element={<NewSubmissionPage />} />
              <Route path="/workspace/processes/:id" element={<ProcessDetailsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
