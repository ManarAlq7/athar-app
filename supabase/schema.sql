-- ============================================================
--  أَثَر | ATHAR — سكيما قاعدة البيانات
--  الصقه كاملاً في: Supabase Dashboard → SQL Editor → New query → Run
--  آمن لإعادة التشغيل أكثر من مرة.
-- ============================================================

-- ---------- 1) جدول الصور ----------

create table if not exists public.photos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,

  title            text not null check (char_length(trim(title)) between 2 and 120),
  description      text not null default '' check (char_length(description) <= 2000),
  category         text not null,
  region           text not null,
  city             text,
  approx_year      integer check (approx_year between 1900 and 2100),
  story            text check (char_length(story) <= 4000),

  tags             text[] not null default '{}',
  visible_elements text[] not null default '{}',

  image_path       text not null,
  ai_assisted      boolean not null default false,

  created_at       timestamptz not null default now()
);

comment on table public.photos is 'صور الأرشيف التي يرفعها المستخدمون';
comment on column public.photos.approx_year is 'السنة التقريبية كما ذكرها المستخدم — لا يُملؤها الذكاء الاصطناعي';
comment on column public.photos.ai_assisted is 'هل استُعين بالذكاء الاصطناعي في التوثيق — يُعرض كشارة شفافية';

-- ---------- 2) فهارس البحث والتصفية ----------

create index if not exists photos_created_at_idx on public.photos (created_at desc);
create index if not exists photos_region_idx     on public.photos (region);
create index if not exists photos_category_idx   on public.photos (category);
create index if not exists photos_user_idx       on public.photos (user_id, created_at desc);
create index if not exists photos_tags_idx       on public.photos using gin (tags);

-- بحث نصي عربي عبر trigram — يعمل مع الكلمات الجزئية والأخطاء الإملائية البسيطة،
-- وهو أنسب للعربية من to_tsvector لأن Postgres لا يوفّر قاموساً عربياً افتراضياً.
create extension if not exists pg_trgm;

create index if not exists photos_search_idx
  on public.photos
  using gin ((title || ' ' || description || ' ' || coalesce(city, '') || ' ' || region) gin_trgm_ops);

-- ---------- 3) تفعيل حماية مستوى الصف ----------

alter table public.photos enable row level security;

-- الأرشيف عام: أي زائر يقرأ.
drop policy if exists "الأرشيف مقروء للجميع" on public.photos;
create policy "الأرشيف مقروء للجميع"
  on public.photos for select
  using (true);

-- الإضافة تتطلب تسجيل دخول، والسجل يُنسب لصاحبه حصراً.
drop policy if exists "المستخدم يضيف صوره فقط" on public.photos;
create policy "المستخدم يضيف صوره فقط"
  on public.photos for insert
  to authenticated
  with check (auth.uid() = user_id);

-- التعديل والحذف لصاحب الصورة وحده.
drop policy if exists "المستخدم يعدّل صوره فقط" on public.photos;
create policy "المستخدم يعدّل صوره فقط"
  on public.photos for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "المستخدم يحذف صوره فقط" on public.photos;
create policy "المستخدم يحذف صوره فقط"
  on public.photos for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- 4) حاوية تخزين الصور ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  8388608,                                            -- ٨ ميجابايت
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- الصور معروضة للجميع (الأرشيف عام).
drop policy if exists "الصور معروضة للجميع" on storage.objects;
create policy "الصور معروضة للجميع"
  on storage.objects for select
  using (bucket_id = 'photos');

-- كل مستخدم يرفع داخل مجلد باسم معرّفه فقط: photos/<uid>/<file>
-- هذا يمنع الكتابة فوق ملفات الآخرين.
drop policy if exists "المستخدم يرفع في مجلده" on storage.objects;
create policy "المستخدم يرفع في مجلده"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "المستخدم يحذف من مجلده" on storage.objects;
create policy "المستخدم يحذف من مجلده"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- 5) إحصاءات الصفحة الرئيسية ----------

-- دالة واحدة بدل ثلاثة استعلامات من المتصفح.
create or replace function public.archive_stats()
returns table (photo_count bigint, region_count bigint, contributor_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*)                    as photo_count,
    count(distinct region)      as region_count,
    count(distinct user_id)     as contributor_count
  from public.photos;
$$;

grant execute on function public.archive_stats() to anon, authenticated;
