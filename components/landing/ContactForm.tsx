"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

const contactSchema = z.object({
  fullName: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  message: z.string().min(10, "Por favor, detalla tu consulta"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", message: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setLoading(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error("Error al enviar el formulario");
      }
      toast.success("Mensaje enviado. Te contactaremos pronto.");
      form.reset();
    } catch {
      toast.error("No pudimos enviar tu mensaje. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight">Contacto</h2>
        <p className="mt-2 text-muted-foreground">
          ¿Tenés dudas, feedback o querés hablar del programa? Escribinos.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="mx-auto mt-10 max-w-2xl border border-border bg-card p-6"
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="col-span-1 space-y-2">
            <Label htmlFor="fullName" className="mb-1">
              Nombre completo
            </Label>
            <Input
              id="fullName"
              placeholder="Tu nombre"
              {...form.register("fullName")}
              aria-invalid={!!form.formState.errors.fullName}
            />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>
          <div className="col-span-1 space-y-2">
            <Label htmlFor="email" className="mb-1">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...form.register("email")}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="col-span-1 sm:col-span-2 space-y-2">
            <Label htmlFor="message" className="mb-1">
              Mensaje
            </Label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Contanos en qué podemos ayudarte"
              {...form.register("message")}
              aria-invalid={!!form.formState.errors.message}
            />
            {form.formState.errors.message && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>
          <div className="col-span-1 sm:col-span-2">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
