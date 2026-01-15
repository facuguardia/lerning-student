import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const payload = {
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      message: parsed.data.message,
    }

    const webhook = process.env.CONTACT_WEBHOOK_URL
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return NextResponse.json({ ok: true })
    }

    const supabase = await createClient()
    await supabase.from('contact_requests').insert(payload)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

