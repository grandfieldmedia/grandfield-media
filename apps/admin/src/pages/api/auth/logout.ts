import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../../lib/supabase-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServer(cookies, request.headers);
  await supabase.auth.signOut();
  return redirect('/login');
};
