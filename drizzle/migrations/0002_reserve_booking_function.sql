CREATE OR REPLACE FUNCTION public.reserve_booking(
  _session_id uuid, _customer_id uuid, _item_key text, _item_name text,
  _amount_paise integer, _hold_expires_at timestamptz
) RETURNS TABLE(booking_id uuid, booking_status public.booking_status)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cap int; _taken int; _status public.booking_status; _id uuid;
BEGIN
  SELECT capacity INTO _cap FROM public.sessions WHERE id = _session_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Session not found'; END IF;
  SELECT count(*)::int INTO _taken FROM public.bookings b
   WHERE b.session_id = _session_id
     AND (b.status IN ('confirmed','cancel_requested') OR (b.status = 'held' AND b.hold_expires_at > now()));
  _status := CASE WHEN _taken >= _cap THEN 'waitlisted'::public.booking_status ELSE 'held'::public.booking_status END;
  INSERT INTO public.bookings(session_id, customer_id, item_key, item_name, status, amount_paise, hold_expires_at)
  VALUES (_session_id, _customer_id, _item_key, _item_name, _status, _amount_paise,
          CASE WHEN _status = 'held' THEN _hold_expires_at ELSE NULL END)
  RETURNING id INTO _id;
  RETURN QUERY SELECT _id, _status;
END $$;
REVOKE EXECUTE ON FUNCTION public.reserve_booking(uuid, uuid, text, text, integer, timestamptz) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.reserve_booking(uuid, uuid, text, text, integer, timestamptz) TO service_role;