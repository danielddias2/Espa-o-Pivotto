import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Redireciona se já autenticado
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin'
        navigate(from, { replace: true })
      }
    })
  }, [navigate, location])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais de acesso.')
      return
    }

    const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin'
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5] px-5 py-12">
      <div className="w-full max-w-md bg-white border border-[#EBE3DC] rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        {/* Logo / Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group">
            <img 
              src="/images/logo/logo-clean.png" 
              alt="Espaço Pivotto" 
              className="h-14 mx-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-normal text-[#2D242D]">
              Painel de Gestão
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A882] font-semibold mt-1">
              Acesso Restrito
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-[#5C4A5A]">
              E-mail de Acesso
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-[#E2D8D0] bg-[#FAF7F5] rounded-xl text-[#2D242D] placeholder:text-[#A898A6] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-all"
              placeholder="admin@espacopivotto.com.br"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs uppercase tracking-wider font-semibold text-[#5C4A5A]">
                Senha
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-[#E2D8D0] bg-[#FAF7F5] rounded-xl text-[#2D242D] placeholder:text-[#A898A6] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full justify-center shadow-md shadow-[#7D3B7C]/20"
          >
            Entrar no Painel
          </Button>

          <div className="text-center pt-2">
            <Link 
              to="/" 
              className="text-xs text-[#7D3B7C] hover:underline font-medium inline-flex items-center gap-1"
            >
              ← Voltar ao site oficial
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
