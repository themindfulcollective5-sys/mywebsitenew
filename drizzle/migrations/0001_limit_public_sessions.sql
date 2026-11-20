DROP POLICY "anyone reads sessions" ON public.sessions;
CREATE POLICY "public reads upcoming sessions" ON public.sessions FOR SELECT TO anon, authenticated
  USING (starts_at >= now() - interval '1 day');