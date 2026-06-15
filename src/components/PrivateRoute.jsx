import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spin } from 'antd'

export function PrivateRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div>
        <Spin size="large" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
