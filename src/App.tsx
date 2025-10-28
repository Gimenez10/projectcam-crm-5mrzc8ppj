import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import OrdensServicoListPage from './pages/ordens-de-servico/OrdensServicoListPage'
import NovaOrdemServicoPage from './pages/ordens-de-servico/NovaOrdemServicoPage'
import EditarOrdemServicoPage from './pages/ordens-de-servico/EditarOrdemServicoPage'
import AprovacoesPage from './pages/aprovacoes/AprovacoesPage'
import SettingsPage from './pages/settings/SettingsPage'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import AuthLayout from './components/AuthLayout'
import ProdutosListPage from './pages/produtos/ProdutosListPage'
import GerenciarProdutoPage from './pages/produtos/GerenciarProdutoPage'
import ClientesListPage from './pages/clientes/ClientesListPage'
import GerenciarClientePage from './pages/clientes/GerenciarClientePage'

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route
                  path="/ordens-de-servico"
                  element={<OrdensServicoListPage />}
                />
                <Route
                  path="/ordens-de-servico/nova"
                  element={<NovaOrdemServicoPage />}
                />
                <Route
                  path="/ordens-de-servico/editar/:id"
                  element={<EditarOrdemServicoPage />}
                />
                <Route path="/produtos" element={<ProdutosListPage />} />
                <Route
                  path="/produtos/novo"
                  element={<GerenciarProdutoPage />}
                />
                <Route
                  path="/produtos/editar/:id"
                  element={<GerenciarProdutoPage />}
                />
                <Route path="/clientes" element={<ClientesListPage />} />
                <Route
                  path="/clientes/novo"
                  element={<GerenciarClientePage />}
                />
                <Route
                  path="/clientes/editar/:id"
                  element={<GerenciarClientePage />}
                />
                <Route path="/aprovacoes" element={<AprovacoesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
