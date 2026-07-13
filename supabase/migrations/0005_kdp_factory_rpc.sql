-- KDPFactory — orchestration helper RPCs (called by the n8n Runner via PostgREST /rpc)
-- Additive to the kdp_factory schema. Safe to re-run (create or replace).

-- claim_next_step: atomically claim the oldest pending step for a book and mark it
-- running. FOR UPDATE SKIP LOCKED makes a duplicate webhook firing claim NOTHING
-- (returns null row) — this is the idempotency guard. Returns the claimed step, or
-- a row of NULLs if none pending.
create or replace function kdp_factory.claim_next_step(p_book_id uuid)
returns kdp_factory.book_steps
language plpgsql
as $$
declare s kdp_factory.book_steps;
begin
  update kdp_factory.book_steps
     set status = 'running', started_at = now(), attempts = attempts + 1
   where id = (
     select id from kdp_factory.book_steps
      where book_id = p_book_id and status = 'pending'
      order by index asc, created_at asc
      limit 1
      for update skip locked
   )
  returning * into s;
  return s;   -- NULL id ⇒ nothing was pending / claimable
end$$;

-- has_pending_steps: cheap boolean for the "more to do?" check after a step.
create or replace function kdp_factory.has_pending_steps(p_book_id uuid)
returns boolean
language sql
as $$
  select exists (
    select 1 from kdp_factory.book_steps
     where book_id = p_book_id and status = 'pending'
  );
$$;

grant execute on function kdp_factory.claim_next_step(uuid)   to service_role;
grant execute on function kdp_factory.has_pending_steps(uuid) to service_role;
