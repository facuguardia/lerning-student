import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Award, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Vibe Learning</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h1 className="text-balance text-5xl font-bold tracking-tight lg:text-6xl">
                Aprende desarrollo web de forma estructurada
              </h1>
              <p className="text-pretty text-lg text-muted-foreground">
                Un sistema de aprendizaje progresivo con módulos, quizzes y proyectos prácticos. Avanza a tu ritmo y
                obtén feedback personalizado.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2">
                    Comenzar Ahora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Módulos"
                description="Contenido estructurado desde fundamentos hasta producción"
              />
              <FeatureCard
                icon={<Award className="h-6 w-6" />}
                title="Quizzes"
                description="Evalúa tu progreso con calificación automática"
              />
              <FeatureCard
                icon={<GraduationCap className="h-6 w-6" />}
                title="Proyectos"
                description="Aplica lo aprendido con trabajos prácticos"
              />
              <FeatureCard
                icon={<ArrowRight className="h-6 w-6" />}
                title="Progresión"
                description="Desbloquea módulos al aprobar cada quiz"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border">
            <StatBlock value="70%" label="Nota mínima para avanzar" />
            <StatBlock value="5" label="Módulos completos" />
            <StatBlock value="100%" label="Feedback personalizado" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>Vibe Learning LMS — Sistema de Gestión de Aprendizaje</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="space-y-3 border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
