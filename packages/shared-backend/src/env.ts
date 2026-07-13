/**
 * Server-side environment access for the shared backend.
 * These are read from process.env at call time (never bundled to the client).
 * PUBLIC_* vars (PostHog, Stripe publishable, Meta pixel) are handled by each
 * site/app on the client and are intentionally NOT read here.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[shared-backend] Missing required environment variable: ${name}`
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  // Supabase
  get SUPABASE_URL() {
    return required('SUPABASE_URL');
  },
  get SUPABASE_ANON_KEY() {
    return required('SUPABASE_ANON_KEY');
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },

  // Stripe (optional until keys are provided — helpers throw clearly if used without them)
  get STRIPE_SECRET_KEY() {
    return optional('STRIPE_SECRET_KEY');
  },
  get STRIPE_WEBHOOK_SECRET() {
    return optional('STRIPE_WEBHOOK_SECRET');
  },

  // Resend
  get RESEND_API_KEY() {
    return optional('RESEND_API_KEY');
  },

  // Admin
  get ADMIN_EMAILS() {
    return optional('ADMIN_EMAILS') ?? '';
  },

  // KDPFactory
  get ANTHROPIC_API_KEY() {
    return optional('ANTHROPIC_API_KEY');
  },
  // The n8n KDPFactory Runner webhook (Run/Resume post {book_id} here).
  get KDP_RUN_WEBHOOK_URL() {
    return optional('KDP_RUN_WEBHOOK_URL');
  },
  // Shared secret guarding the /api/kdp/assemble endpoint (n8n sends it).
  get KDP_ASSEMBLE_SECRET() {
    return optional('KDP_ASSEMBLE_SECRET');
  },
};
