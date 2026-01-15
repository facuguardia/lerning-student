'use client'

import { motion } from 'framer-motion'

function StatBlock({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      className="px-6 py-12 text-center"
    >
      <p className="text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}

export function Stats({ moduleCount }: { moduleCount: number }) {
  return (
    <section className="border-y border-border bg-secondary/50">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border"
      >
        <StatBlock value="80%" label="Nota mínima para avanzar" delay={0.05} />
        <StatBlock value={`${moduleCount}`} label="Módulos publicados" delay={0.1} />
        <StatBlock value="100%" label="Feedback personalizado" delay={0.15} />
      </motion.div>
    </section>
  )
}

