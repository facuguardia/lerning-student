'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export function HeaderBar() {
  return (
    <header className="border-b border-border">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
      >
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
      </motion.div>
    </header>
  )
}

