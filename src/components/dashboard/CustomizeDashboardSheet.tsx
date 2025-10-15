import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DashboardWidget, WidgetConfig } from '@/types'

interface CustomizeDashboardSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgets: WidgetConfig[]
  onWidgetsChange: (widgets: WidgetConfig[]) => void
  onSave: () => void
  isSaving: boolean
}

const availableWidgets: DashboardWidget[] = [
  {
    id: 'kpiCards',
    name: 'Cartões de KPI',
    description: 'Visão geral dos principais indicadores de desempenho.',
  },
  {
    id: 'vendasMensais',
    name: 'Vendas Mensais',
    description: 'Gráfico de barras com o total de vendas por mês.',
  },
  {
    id: 'statusDistribuicao',
    name: 'Distribuição por Status',
    description:
      'Gráfico de pizza mostrando a distribuição de O.S. por status.',
  },
  {
    id: 'topClientes',
    name: 'Top Clientes',
    description: 'Gráfico com os clientes que mais compraram.',
  },
  {
    id: 'atividadeRecente',
    name: 'Atividade Recente',
    description: 'Lista das últimas atualizações nas ordens de serviço.',
  },
  {
    id: 'vendasVendedor',
    name: 'Vendas por Vendedor',
    description: 'Gráfico de O.S. criadas por cada vendedor.',
  },
]

export const CustomizeDashboardSheet = ({
  open,
  onOpenChange,
  widgets,
  onWidgetsChange,
  onSave,
  isSaving,
}: CustomizeDashboardSheetProps) => {
  const handleToggleWidget = (widgetId: string, checked: boolean) => {
    let newWidgets
    if (checked) {
      const widgetToAdd = availableWidgets.find((w) => w.id === widgetId)
      if (widgetToAdd) {
        newWidgets = [...widgets, { id: widgetToAdd.id }]
      }
    } else {
      newWidgets = widgets.filter((w) => w.id !== widgetId)
    }
    if (newWidgets) {
      onWidgetsChange(newWidgets)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Personalizar Dashboard</SheetTitle>
          <SheetDescription>
            Selecione os widgets que você deseja exibir no seu painel.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          {availableWidgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-0.5">
                <Label htmlFor={`widget-${widget.id}`}>{widget.name}</Label>
                <p className="text-xs text-muted-foreground">
                  {widget.description}
                </p>
              </div>
              <Switch
                id={`widget-${widget.id}`}
                checked={widgets.some((w) => w.id === widget.id)}
                onCheckedChange={(checked) =>
                  handleToggleWidget(widget.id, checked)
                }
              />
            </div>
          ))}
        </div>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
