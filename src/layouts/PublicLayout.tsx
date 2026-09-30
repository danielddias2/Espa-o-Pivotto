import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] selection:bg-[#7D3B7C] selection:text-white">
      <Navbar />
      <main id="main-content" className="flex-1 pt-14 sm:pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
