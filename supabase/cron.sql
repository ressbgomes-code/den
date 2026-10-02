-- Agenda o envio de notificações a cada 30 segundos.
-- Troque SEU_CRON_SECRET pelo mesmo valor salvo no segredo CRON_SECRET da função.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'den-lembretes',
  '30 seconds',
  $$ select net.http_post(
       url := 'https://uivvbxriwsujcgkzilyk.supabase.co/functions/v1/send-reminders',
       headers := '{"Content-Type": "application/json", "x-cron-secret": "SEU_CRON_SECRET"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);

-- Para parar: select cron.unschedule('den-lembretes');
