-- Enable Supabase Realtime for connection request notifications.

ALTER TABLE public.connections REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
