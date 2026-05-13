import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Workspace from './pages/Workspace/Workspace'
import MainLayout from './layouts/MainLayout'
import PrivateLayout from './layouts/PrivateLayout'
import './App.css'

export default function App() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light'
  })

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('theme-light')
      localStorage.setItem('theme', 'light')
    } else {
      document.body.classList.remove('theme-light')
      localStorage.setItem('theme', 'dark')
    }
  }, [isLight])

  const onThemeToggle = () => setIsLight(!isLight)

  return (
    <Router>
      <Routes>
        {/* Global Layout (Root) */}
        <Route element={<MainLayout isLight={isLight} onThemeToggle={onThemeToggle} />}>
          {/* Public Routes */}
          <Route path="/" element={<Landing isLight={isLight} onThemeToggle={onThemeToggle} />} />
          <Route path="/login" element={<Login />} />
          
          {/* Private Routes with Sidebar */}
          <Route element={<PrivateLayout />}>
            <Route path="/workspace" element={<Workspace isLight={isLight} onThemeToggle={onThemeToggle} />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
