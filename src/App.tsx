import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import OrcamentosListPage from './pages/orcamentos/OrcamentosListPage'
import NovoOrcamentoPage from './pages/orcamentos/NovoOrcamentoPage'
import EditarOrcamentoPage from './pages/orcamentos/EditarOrcamentoPage'
import AprovacoesPage from './pages/aprovacoes/AprovacoesPage'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/orcamentos" element={<OrcamentosListPage />} />
          <Route path="/orcamentos/novo" element={<NovoOrcamentoPage />} />
          <Route
            path="/orcamentos/editar/:id"
            element={<EditarOrcamentoPage />}
          />
          <Route path="/aprovacoes" element={<AprovacoesPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
