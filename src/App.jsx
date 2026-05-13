import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Workspace from './pages/Workspace/Workspace'
import useMockStore from './store/useMockStore'
import './App.css'

export default function App() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light'
  })

  const user = useMockStore((state) => state.user)

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
        <Route 
          path="/" 
          element={<Landing isLight={isLight} onThemeToggle={onThemeToggle} />} 
        />
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/workspace" 
          element={user ? <Workspace isLight={isLight} onThemeToggle={onThemeToggle} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  )
}