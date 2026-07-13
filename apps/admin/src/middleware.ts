import { defineMiddleware } from 'astro:middleware';
import { isAllowedAdmin } from '@grandfield/shared-backend';
import { createSupabaseServer } from './lib/supabase-server';

// Routes reachable without a session.
// /api/kdp/assemble is machine-to-machine (n8n) — it guards itself with a
// shared secret, so it must bypass the interactive login wall.
const PUBLIC_PATHS = new Set([
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/kdp/assemble',
  '/api/kdp/steps/run',
  '/api/kdp/steps/claim',
  '/api/kdp/steps/done',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/_')) {
    return next();
  }

  const supabase = createSupabaseServer(context.cookies, context.request.headers);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdmin(user.email)) {
    return context.redirect('/login');
  }

  context.locals.user = { id: user.id, email: user.email };
  return next();
});
