'use client'

import { motion } from 'framer-motion'

interface Testimonial {
  name: string
  role: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Lucía Fernández',
    role: 'Frontend Developer',
    quote:
      'La estructura por módulos y el feedback en proyectos me ayudaron a avanzar sin perder tiempo. Muy recomendable.',
  },
  {
    name: 'Matías Pérez',
    role: 'Full Stack Developer',
    quote:
      'Los quizzes obligan a entender de verdad los conceptos. El enfoque práctico es excelente.',
  },
  {
    name: 'Sofía Romero',
    role: 'UX Engineer',
    quote:
      'Me encantó la claridad de los contenidos y la progresión. La comunidad y correcciones fueron clave.',
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight">Testimonios</h2>
        <p className="mt-2 text-muted-foreground">
          Estudiantes que lograron resultados concretos con nuestro enfoque.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: i * 0.05 }}
            className="border border-border bg-card p-6"
          >
            <p className="text-sm text-muted-foreground">{t.quote}</p>
            <div className="mt-4">
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

