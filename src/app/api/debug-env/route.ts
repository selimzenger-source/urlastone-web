import { NextResponse } from 'next/server'

// Temporary debug endpoint - DELETE after fixing
export async function GET() {
  const pw = process.env.ADMIN_PASSWORD || '(not set)'
  return NextResponse.json({
    pw_length: pw.length,
    pw_first3: pw.substring(0, 3),
    pw_last3: pw.substring(pw.length - 3),
    has_spaces: pw !== pw.trim(),
    has_quotes: pw.includes('"') || pw.includes("'"),
  })
}
