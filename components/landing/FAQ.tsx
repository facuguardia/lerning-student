"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const items: FAQItem[] = [
  {
    question: "¿Cómo funciona la progresión por módulos?",
    answer:
      "Cada módulo se desbloquea al aprobar el quiz anterior con una nota mínima del 80%. Así garantizamos una progresión sólida.",
  },
  {
    question: "¿Recibo feedback sobre mis proyectos?",
    answer:
      "Sí. Los trabajos prácticos se corrigen y reciben feedback personalizado para ayudarte a mejorar con ejemplos concretos.",
  },
  {
    question: "¿Puedo avanzar a mi ritmo?",
    answer:
      "Totalmente. No hay horarios fijos. Puedes estudiar cuando quieras y retomar desde donde lo dejaste.",
  },
  {
    question: "¿Qué necesito para comenzar?",
    answer:
      "Conexión a internet y ganas de aprender. Recomendamos VS Code y una cuenta de GitHub para gestionar tus proyectos.",
  },
];

export function FAQ() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight">
          Preguntas frecuentes
        </h2>
        <p className="mt-2 text-muted-foreground">
          Respuestas claras para que puedas enfocarte en aprender sin
          fricciones.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="mx-auto mt-10 max-w-3xl"
      >
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
