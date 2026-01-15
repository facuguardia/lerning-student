'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Award, ArrowRight } from 'lucide-react'

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      className="space-y-3 border border-border bg-card p-6"
    >
      <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h1 className="text-balance text-5xl font-bold tracking-tight lg:text-6xl">
            Aprende desarrollo web de forma estructurada
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Un sistema de aprendizaje progresivo con módulos, quizzes y proyectos prácticos. Avanza a tu ritmo y obtén feedback personalizado.
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
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Módulos"
            description="Contenido estructurado desde fundamentos hasta producción"
            delay={0.05}
          />
          <FeatureCard
            icon={<Award className="h-6 w-6" />}
            title="Quizzes"
            description="Evalúa tu progreso con calificación automática"
            delay={0.1}
          />
          <FeatureCard
            icon={<GraduationCap className="h-6 w-6" />}
            title="Proyectos"
            description="Aplica lo aprendido con trabajos prácticos"
            delay={0.15}
          />
          <FeatureCard
            icon={<ArrowRight className="h-6 w-6" />}
            title="Progresión"
            description="Desbloquea módulos al aprobar cada quiz"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  )
}

