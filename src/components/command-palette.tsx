'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Package,
  Users,
  Settings,
  Search,
  Home,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  keywords?: string[]
}

const navigationItems: NavigationItem[] = [
  {
    label: "Painel",
    href: "/",
    icon: Home,
    keywords: ["home", "inicio", "dashboard"],
  },
  {
    label: "Concursos",
    href: "/rfps",
    icon: FileText,
    keywords: ["rfp", "pedidos", "propostas"],
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Package,
    keywords: ["produtos", "artigos", "stock"],
  },
  {
    label: "Utilizadores",
    href: "/admin/users",
    icon: Users,
    keywords: ["admin", "gestao", "users"],
  },
  {
    label: "Definicoes",
    href: "/admin/settings",
    icon: Settings,
    keywords: ["configuracoes", "settings", "opcoes"],
  },
]

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Navegacao rapida"
      description="Pesquisar paginas e accoes"
    >
      <CommandInput placeholder="Pesquisar..." />
      <CommandList>
        <CommandEmpty>Sem resultados.</CommandEmpty>
        <CommandGroup heading="Navegacao">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords?.join(" ") || ""}`}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

// Export a keyboard shortcut hint component
export function CommandPaletteHint({ className }: { className?: string }) {
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  return (
    <kbd className={className}>
      {isMac ? "⌘" : "Ctrl"}+K
    </kbd>
  )
}
