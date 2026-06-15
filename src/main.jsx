import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.jsx'
import { customTheme } from './theme'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={customTheme}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
)
