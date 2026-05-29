import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Workspace from './pages/Workspace/Workspace'
import FormBuilderPage from './pages/FormBuilder/FormBuilderPage'
import SubmissionTypePage from './pages/SubmissionType/SubmissionTypePage'
import MainLayout from './layouts/MainLayout'
import PrivateLayout from './layouts/PrivateLayout'
import './App.css'

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('theme-dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('theme-dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const onThemeToggle = () => setIsDark(!isDark)

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Global Layout (Root) */}
        <Route element={<MainLayout isDark={isDark} onThemeToggle={onThemeToggle} />}>
          {/* Public Routes */}
          <Route path="/" element={<Landing isDark={isDark} onThemeToggle={onThemeToggle} />} />
          <Route path="/login" element={<Login />} />
          
          {/* Private Routes with Sidebar */}
          <Route element={<PrivateLayout />}>
            <Route path="/workspace" element={<Workspace isDark={isDark} onThemeToggle={onThemeToggle} />} />
            <Route path="/workspace/:processId" element={<Workspace isDark={isDark} onThemeToggle={onThemeToggle} />} />
            <Route path="/form-builder" element={<FormBuilderPage />} />
            <Route path="/new-submission" element={<SubmissionTypePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
