"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

// Portuguese route labels mapping
const routeLabels: Record<string, string> = {
  "": "Início",
  "rfps": "Concursos",
  "inventory": "Inventário",
  "admin": "Administração",
  "users": "Utilizadores",
  "settings": "Definições",
  "matches": "Correspondências",
}

// Single-level pages that show "Início" only
const singleLevelRoutes = ["/", "/rfps", "/inventory"]

// Route patterns where breadcrumbs should be hidden entirely
const hideBreadcrumbPatterns = [
  /^\/rfps\/[^/]+\/matches$/, // /rfps/[id]/matches - has its own header
]

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Hide on pattern-matched routes
  if (hideBreadcrumbPatterns.some(pattern => pattern.test(pathname))) {
    return null
  }

  // Single-level pages: show just "Início" with home icon
  if (singleLevelRoutes.includes(pathname)) {
    return (
      <nav className="flex items-center text-sm">
        <div className="flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">Início</span>
        </div>
      </nav>
    )
  }

  const segments = pathname.split("/").filter(Boolean)

  // Build breadcrumb items (max 2 levels)
  const items = segments.slice(0, 2).map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.slice(0, 2).length - 1 || index === segments.length - 1

    // Get label from mapping or capitalize
    let label = routeLabels[segment]
    if (!label) {
      if (segment.match(/^[0-9a-f-]{8,}$/i)) {
        label = "Detalhes"
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
      }
    }

    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center text-sm">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
          )}
          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
