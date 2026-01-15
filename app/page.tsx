import type React from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { ContactForm } from "@/components/landing/ContactForm";
import { CTA } from "@/components/landing/CTA";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { HeaderBar } from "@/components/landing/HeaderBar";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("is_published", true);
  const moduleCount = modules?.length ?? 0;
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderBar />

      <main>
        <Hero />

        <Stats moduleCount={moduleCount} />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ */}
        <FAQ />

        {/* Contact */}
        <ContactForm />

        {/* CTA */}
        <CTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>
            Vibe Learning · Creado por{" "}
            <a
              href="https://www.facuguardia.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground no-underline hover:text-primary hover:no-underline"
            >
              Facu Guardia
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
