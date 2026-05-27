import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _c: SupabaseClient | null = null

/**
 * Lazy Supabase client for URLAKLINKER data (urlaklinker_blogs table).
 * Falls back to URLASTONE Supabase env if URLAKLINKER_* not set
 * (currently both brands share the same Supabase project, different tables).
 */
export function getUrlaklinkerSupabase(): SupabaseClient {
  if (_c) return _c
  const url = (process.env.URLAKLINKER_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace(/^﻿/, '')
    .trim()
  const key = (process.env.URLAKLINKER_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '')
    .replace(/^﻿/, '')
    .trim()
  if (!url || !key) {
    throw new Error('Missing URLAKLINKER_SUPABASE_URL or URLAKLINKER_SUPABASE_SERVICE_ROLE_KEY')
  }
  _c = createClient(url, key, { auth: { persistSession: false } })
  return _c
}
