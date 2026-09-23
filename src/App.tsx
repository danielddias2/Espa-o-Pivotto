import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Home from '@/pages/Home'
import Agendamento from '@/pages/Agendamento'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminAgenda from '@/pages/admin/Agenda'
import AdminClientes from '@/pages/admin/Clientes'
import AdminServicos from '@/pages/admin/Servicos'
import AdminConfiguracoes from '@/pages/admin/Configuracoes'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="agendamento" element={<Agendamento />} />
        </Route>

        {/* Admin login (sem layout guard) */}
        <Route path="admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="agenda" element={<AdminAgenda />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="servicos" element={<AdminServicos />} />
          <Route path="configuracoes" element={<AdminConfiguracoes />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
