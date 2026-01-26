import { FileText, Package, History } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo ao Cardiva - Correspondência de Concursos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/rfps"
          className="flex flex-col gap-4 rounded-lg border p-6 transition-colors hover:bg-accent"
        >
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Carregar Concurso</h2>
            <p className="text-sm text-muted-foreground">
              Carregar PDF para iniciar correspondência
            </p>
          </div>
        </Link>

        <Link
          href="/inventory"
          className="flex flex-col gap-4 rounded-lg border p-6 transition-colors hover:bg-accent"
        >
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Inventário</h2>
            <p className="text-sm text-muted-foreground">
              Consultar e gerir produtos
            </p>
          </div>
        </Link>

        <Link
          href="/history"
          className="flex flex-col gap-4 rounded-lg border p-6 transition-colors hover:bg-accent"
        >
          <History className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Histórico</h2>
            <p className="text-sm text-muted-foreground">
              Ver concursos anteriores
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
