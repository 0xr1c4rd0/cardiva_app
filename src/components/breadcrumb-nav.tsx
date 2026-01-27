"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Portuguese route labels mapping
const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "rfps": "Concursos",
  "inventory": "Inventário",
  "admin": "Administração",
  "users": "Utilizadores",
  "settings": "Definições",
  "matches": "Correspondências",
}

// Pages under "Geral" section - show "Geral > Page"
const geralRoutes: Record<string, string> = {
  "/": "Dashboard",
  "/rfps": "Concursos",
  "/inventory": "Inventário",
}

// Route patterns where breadcrumbs should be hidden entirely
const hideBreadcrumbPatterns = [
  /^\/rfps\/[^/]+\/matches$/, // /rfps/[id]/matches - has its own header
]

// Routes that are section labels only (no landing page)
const nonClickableRoutes = ["/admin"]

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Hide on pattern-matched routes
  if (hideBreadcrumbPatterns.some(pattern => pattern.test(pathname))) {
    return null
  }

  // "Geral" section pages: show "Geral > Page Name"
  if (geralRoutes[pathname]) {
    return (
      <nav className="flex items-center text-sm">
        <span className="text-muted-foreground">Geral</span>
        <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="font-medium text-foreground">{geralRoutes[pathname]}</span>
      </nav>
    )
  }

  const segments = pathname.split("/").filter(Boolean)

  // Hide if no segments
  if (segments.length === 0) {
    return null
  }

  // Build breadcrumb items (max 2 levels)
  const items = segments.slice(0, 2).map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.slice(0, 2).length - 1 || index === segments.length - 1
    const isClickable = !nonClickableRoutes.includes(href)

    // Get label from mapping or capitalize
    let label = routeLabels[segment]
    if (!label) {
      if (segment.match(/^[0-9a-f-]{8,}$/i)) {
        label = "Detalhes"
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
      }
    }

    return { href, label, isLast, isClickable }
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
          ) : item.isClickable ? (
            <Link
              href={item.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-muted-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
