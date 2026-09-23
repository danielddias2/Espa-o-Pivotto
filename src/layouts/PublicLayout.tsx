import { Outlet } from 'react-router-dom'
import FloatingNavbar from '@/components/layout/FloatingNavbar'
import Footer from '@/components/layout/Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] selection:bg-[#7D3B7C] selection:text-white">
      <FloatingNavbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
