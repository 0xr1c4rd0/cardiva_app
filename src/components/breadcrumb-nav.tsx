"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Portuguese route labels mapping
const routeLabels: Record<string, string> = {
  "rfps": "Concursos",
  "inventory": "Inventário",
  "admin": "Administração",
  "users": "Utilizadores",
  "settings": "Definições",
  "matches": "Correspondências",
}

// Routes where breadcrumbs should be hidden (single-level pages)
const hideBreadcrumbRoutes = ["/", "/rfps", "/inventory", "/admin/users"]

// Route patterns where breadcrumbs should be hidden
const hideBreadcrumbPatterns = [
  /^\/rfps\/[^/]+\/matches$/, // /rfps/[id]/matches - has its own header
]

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Hide on explicitly excluded routes
  if (hideBreadcrumbRoutes.includes(pathname)) {
    return null
  }

  // Hide on pattern-matched routes
  if (hideBreadcrumbPatterns.some(pattern => pattern.test(pathname))) {
    return null
  }

  const segments = pathname.split("/").filter(Boolean)

  // Hide if only 1 segment
  if (segments.length <= 1) {
    return null
  }

  // Build breadcrumb items (max 2 levels as requested)
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
