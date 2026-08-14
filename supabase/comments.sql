-- ============================================================
--  أَثَر — جدار الذاكرة (التعليقات)
--  الصقه كاملاً في: Supabase Dashboard → SQL Editor → New query → Run
--  آمن لإعادة التشغيل أكثر من مرة.
--
--  الفكرة: الزائر الذي يعرف المكان يكمّل التوثيق — «أعرف هذا الحي، كان...»
--  فيتحوّل الأرشيف من معرض يُشاهَد إلى ذاكرة جماعية تُكتب.
-- ============================================================

-- ---------- 1) الجدول ----------

create table if not exists public.memories (
  id         uuid primary key default gen_random_uuid(),
  photo_id   uuid not null references public.photos (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,

  -- اسم الكاتب وقت الكتابة: يبقى معروضاً حتى لو غيّر اسمه لاحقاً
  author     text not null check (char_length(trim(author)) between 1 and 60),
  body       text not null check (char_length(trim(body)) between 2 and 1000),

  created_at timestamptz not null default now()
);

comment on table public.memories is 'ذكريات وتعليقات الزوّار على صور الأرشيف';
comment on column public.memories.author is 'اسم الكاتب وقت الكتابة — لقطة لا مرجع، حتى لا يتغيّر أثر رجعياً';

-- ---------- 2) الفهارس ----------

-- الاستعلام الغالب: كل ذكريات صورة واحدة مرتّبة زمنياً
create index if not exists memories_photo_idx on public.memories (photo_id, created_at asc);
create index if not exists memories_user_idx  on public.memories (user_id, created_at desc);

-- ---------- 3) حماية مستوى الصف ----------

alter table public.memories enable row level security;

-- الذكريات معروضة للجميع، كالأرشيف نفسه.
drop policy if exists "الذكريات مقروءة للجميع" on public.memories;
create policy "الذكريات مقروءة للجميع"
  on public.memories for select
  using (true);

-- الكتابة تتطلب تسجيل دخول، والذكرى تُنسب لكاتبها حصراً.
drop policy if exists "المستخدم يكتب باسمه فقط" on public.memories;
create policy "المستخدم يكتب باسمه فقط"
  on public.memories for insert
  to authenticated
  with check (auth.uid() = user_id);

-- التعديل والحذف لصاحب الذكرى وحده.
drop policy if exists "المستخدم يعدّل ذكرياته فقط" on public.memories;
create policy "المستخدم يعدّل ذكرياته فقط"
  on public.memories for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "المستخدم يحذف ذكرياته فقط" on public.memories;
create policy "المستخدم يحذف ذكرياته فقط"
  on public.memories for delete
  to authenticated
  using (auth.uid() = user_id);

-- صاحب الصورة يستطيع حذف ما يُكتب تحت صورته (إدارة المحتوى على صوره).
drop policy if exists "صاحب الصورة يحذف ما تحتها" on public.memories;
create policy "صاحب الصورة يحذف ما تحتها"
  on public.memories for delete
  to authenticated
  using (
    exists (
      select 1 from public.photos p
      where p.id = memories.photo_id and p.user_id = auth.uid()
    )
  );

-- ---------- 4) عدّاد الذكريات لكل صورة ----------

-- يُستخدم في بطاقات الأرشيف لعرض «٣ ذكريات» دون جلب النصوص كلها.
create or replace function public.memory_counts()
returns table (photo_id uuid, memory_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select photo_id, count(*) as memory_count
  from public.memories
  group by photo_id;
$$;

grant execute on function public.memory_counts() to anon, authenticated;
