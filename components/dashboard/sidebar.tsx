"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  LogOut,
  Settings,
  Users,
  ClipboardList,
  Code2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/types"

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = profile.role === "admin"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/modules", label: "Módulos", icon: BookOpen },
    { href: "/dashboard/assignments", label: "Trabajos", icon: FileText },
    // { href: "/dashboard/grades", label: "Calificaciones", icon: Award },
    { href: "/dashboard/final-project", label: "Proyecto Final", icon: Code2 },
    { href: "/dashboard/final-quiz", label: "Quiz Final", icon: ClipboardList },
    // { href: "/dashboard/certificate", label: "Certificado", icon: GraduationCap },
  ]

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/modules", label: "Módulos", icon: BookOpen },
    { href: "/admin/assignments", label: "Trabajos Prácticos", icon: FileText },
    { href: "/admin/quizzes", label: "Quizzes", icon: ClipboardList },
    { href: "/admin/final-projects", label: "Proyectos Finales", icon: Code2 },
    { href: "/admin/students", label: "Estudiantes", icon: Users },
    { href: "/admin/grading", label: "Calificaciones", icon: Award },
  ]

  const links = isAdmin ? adminLinks : studentLinks

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">Vibe Learning</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-sidebar-accent text-sm font-medium uppercase">
            {profile.full_name?.[0] || profile.email[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{profile.full_name || "Usuario"}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{profile.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            asChild
          >
            <Link href={isAdmin ? "/admin/settings" : "/dashboard/settings"}>
              <Settings className="h-4 w-4" />
              Ajustes
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
