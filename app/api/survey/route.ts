import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with anon key for server API handler
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsapp, email, country, status, reason, spend_recency, open_response } = body || {};

    // Server-side validation: all required answers are present
    if (
      !whatsapp || typeof whatsapp !== 'string' || !whatsapp.trim() ||
      !country || typeof country !== 'string' || !country.trim() ||
      !status || typeof status !== 'string' || !status.trim() ||
      !reason || typeof reason !== 'string' || !reason.trim() ||
      !spend_recency || typeof spend_recency !== 'string' || !spend_recency.trim() ||
      !open_response || typeof open_response !== 'string' || !open_response.trim()
    ) {
      return NextResponse.json(
        { error: 'All required questions must be answered before submitting.' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon key is missing in environment variables.');
      return NextResponse.json(
        { error: 'Server configuration error: Supabase credentials missing.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('survey_responses')
      .insert([
        {
          name: typeof name === 'string' && name.trim() ? name.trim() : null,
          whatsapp: whatsapp.trim(),
          email: typeof email === 'string' && email.trim() ? email.trim() : null,
          country: country.trim(),
          status: status.trim(),
          reason: reason.trim(),
          spend_recency: spend_recency.trim(),
          open_response: open_response.trim(),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      let userError = error.message || 'Failed to record response. Please try again.';
      if (error.code === '42P01' || (error.message && error.message.toLowerCase().includes('relation') && error.message.toLowerCase().includes('does not exist'))) {
        userError = 'Database setup required: Please run supabase-survey.sql in your Supabase Dashboard SQL Editor.';
      }
      return NextResponse.json(
        { error: userError },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Survey API exception:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
