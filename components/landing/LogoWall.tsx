'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Award, Code2, LayoutDashboard, Globe } from 'lucide-react'

const logos = [GraduationCap, BookOpen, Award, Code2, LayoutDashboard, Globe]

export function LogoWall() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-6"
        >
          {logos.map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-md border border-border bg-card py-6"
            >
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

