-- Cria o bucket 'questions' no Supabase Storage e a policy de leitura publica.
-- O bucket guarda as imagens das questoes (jpg/webp), com URLs publicas para
-- consumo pelo cliente sem auth. Escrita continua restrita ao service_role
-- (que automaticamente bypassa RLS no Supabase Storage), portanto nao precisa
-- de policy explicita de INSERT/UPDATE/DELETE.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'questions',
  'questions',
  true,
  5000000,
  array['image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policy: qualquer um le do bucket questions
drop policy if exists "questions_public_read" on storage.objects;
create policy "questions_public_read"
  on storage.objects for select
  using (bucket_id = 'questions');
