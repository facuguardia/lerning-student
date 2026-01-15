'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-md border border-border bg-card p-8 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight">Construí tu carrera en desarrollo web</h2>
        <p className="mt-2 text-muted-foreground">
          Módulos claros, quizzes exigentes y proyectos con feedback real.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

