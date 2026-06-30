-- Kediamanku admin backend for Supabase.
-- Run this file in Supabase SQL Editor.
--
-- Setup steps after running:
-- 1. Create an admin account in Supabase Auth.
-- 2. Copy that user's Auth UID.
-- 3. Insert the UID into public.admin_users with the statement near the bottom,
--    or run supabase/register-admin-user.sql after changing the email value.
-- 4. Put your anon public key in supabase-config.js.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_unsafe_url(urls text[])
returns boolean
language sql
immutable
as $$
  select exists (
    select 1
    from unnest(coalesce(urls, '{}'::text[])) as url_value
    where url_value ~* '^[[:space:]]*(javascript|data|vbscript):'
  );
$$;

grant execute on function public.has_unsafe_url(text[]) to anon, authenticated;

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  product_code text,
  category text not null check (category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')),
  description text not null,
  material text not null,
  size text,
  finishing text,
  production_time text,
  packaging_installation text,
  price_range text not null default 'By quotation',
  price_value numeric not null default 0,
  image_url text,
  images text[] not null default '{}',
  image_alt text,
  link_url text,
  newest int not null default 0,
  popular int not null default 0,
  featured boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_products add column if not exists product_code text;
alter table public.catalog_products add column if not exists size text;
alter table public.catalog_products add column if not exists finishing text;
alter table public.catalog_products add column if not exists production_time text;
alter table public.catalog_products add column if not exists packaging_installation text;
alter table public.catalog_products add column if not exists images text[] not null default '{}';

create table if not exists public.business_partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  label text not null default 'Business Partner',
  logo_url text,
  logo_alt text,
  website_url text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_partners add column if not exists slug text;
alter table public.business_partners add column if not exists name text;
alter table public.business_partners add column if not exists label text not null default 'Business Partner';
alter table public.business_partners add column if not exists logo_url text;
alter table public.business_partners add column if not exists logo_alt text;
alter table public.business_partners add column if not exists website_url text;
alter table public.business_partners add column if not exists is_published boolean not null default true;
alter table public.business_partners add column if not exists sort_order int not null default 0;
alter table public.business_partners add column if not exists created_at timestamptz not null default now();
alter table public.business_partners add column if not exists updated_at timestamptz not null default now();

create table if not exists public.home_service_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  image_url text,
  image_alt text,
  link_url text,
  display_number int,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_service_cards add column if not exists slug text;
alter table public.home_service_cards add column if not exists title text;
alter table public.home_service_cards add column if not exists description text;
alter table public.home_service_cards add column if not exists image_url text;
alter table public.home_service_cards add column if not exists image_alt text;
alter table public.home_service_cards add column if not exists link_url text;
alter table public.home_service_cards add column if not exists display_number int;
alter table public.home_service_cards add column if not exists is_published boolean not null default true;
alter table public.home_service_cards add column if not exists sort_order int not null default 0;
alter table public.home_service_cards add column if not exists created_at timestamptz not null default now();
alter table public.home_service_cards add column if not exists updated_at timestamptz not null default now();

create table if not exists public.service_collection_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  service_category text not null check (service_category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')),
  style_type text not null default 'Modern',
  title text not null,
  description text not null,
  image_url text,
  image_alt text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_collection_items add column if not exists slug text;
alter table public.service_collection_items add column if not exists service_category text;
alter table public.service_collection_items add column if not exists style_type text not null default 'Modern';
alter table public.service_collection_items add column if not exists title text;
alter table public.service_collection_items add column if not exists description text;
alter table public.service_collection_items add column if not exists image_url text;
alter table public.service_collection_items add column if not exists image_alt text;
alter table public.service_collection_items add column if not exists is_published boolean not null default true;
alter table public.service_collection_items add column if not exists sort_order int not null default 0;
alter table public.service_collection_items add column if not exists created_at timestamptz not null default now();
alter table public.service_collection_items add column if not exists updated_at timestamptz not null default now();

create table if not exists public.service_feature_options (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  service_category text not null check (service_category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')),
  eyebrow text,
  feature_label text,
  title text not null,
  description text not null,
  image_url text,
  image_alt text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_feature_options add column if not exists slug text;
alter table public.service_feature_options add column if not exists service_category text;
alter table public.service_feature_options add column if not exists eyebrow text;
alter table public.service_feature_options add column if not exists feature_label text;
alter table public.service_feature_options add column if not exists title text;
alter table public.service_feature_options add column if not exists description text;
alter table public.service_feature_options add column if not exists image_url text;
alter table public.service_feature_options add column if not exists image_alt text;
alter table public.service_feature_options add column if not exists is_published boolean not null default true;
alter table public.service_feature_options add column if not exists sort_order int not null default 0;
alter table public.service_feature_options add column if not exists created_at timestamptz not null default now();
alter table public.service_feature_options add column if not exists updated_at timestamptz not null default now();

create table if not exists public.service_faq_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  service_category text not null check (service_category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')),
  question text not null,
  answer text not null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_faq_items add column if not exists slug text;
alter table public.service_faq_items add column if not exists service_category text;
alter table public.service_faq_items add column if not exists question text;
alter table public.service_faq_items add column if not exists answer text;
alter table public.service_faq_items add column if not exists is_published boolean not null default true;
alter table public.service_faq_items add column if not exists sort_order int not null default 0;
alter table public.service_faq_items add column if not exists created_at timestamptz not null default now();
alter table public.service_faq_items add column if not exists updated_at timestamptz not null default now();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')),
  location text,
  project_year int,
  area_scope text,
  materials text,
  image_url text,
  image_alt text,
  tags text[] not null default '{}',
  testimonial_metric text,
  testimonial_metric_label text,
  testimonial_quote text,
  testimonial_client_name text,
  testimonial_client_role text,
  testimonial_image_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists testimonial_metric text;
alter table public.projects add column if not exists testimonial_metric_label text;
alter table public.projects add column if not exists testimonial_quote text;
alter table public.projects add column if not exists testimonial_client_name text;
alter table public.projects add column if not exists testimonial_client_role text;
alter table public.projects add column if not exists testimonial_image_url text;

do $$
begin
  update public.projects
  set
    tags = case
      when category is not null and not (category = any(tags)) then array_append(tags, category)
      else tags
    end,
    category = 'Kitchen Set'
  where category in ('Storage', 'Apartment', 'House');

  alter table public.projects drop constraint if exists projects_category_check;
  if not exists (select 1 from pg_constraint where conname = 'projects_service_category_check') then
    alter table public.projects add constraint projects_service_category_check check (
      category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')
    );
  end if;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  service_interest text check (
    service_interest is null or
    service_interest in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak', 'General Consultation')
  ),
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'archived')),
  source text not null default 'website',
  website text,
  form_started_at timestamptz,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads add column if not exists website text;
alter table public.leads add column if not exists form_started_at timestamptz;
alter table public.leads add column if not exists user_agent text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_public_text_lengths'
  ) then
    alter table public.leads
    add constraint leads_public_text_lengths
    check (
      char_length(name) <= 160 and
      char_length(coalesce(phone, '')) <= 40 and
      char_length(coalesce(email, '')) <= 180 and
      char_length(coalesce(message, '')) <= 2000 and
      char_length(coalesce(source, '')) <= 80 and
      char_length(coalesce(website, '')) <= 200 and
      char_length(coalesce(user_agent, '')) <= 260
    );
  end if;
end $$;

create or replace function public.is_valid_public_lead(
  _phone text,
  _email text,
  _website text,
  _form_started_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int := 0;
  clean_phone text := nullif(trim(coalesce(_phone, '')), '');
  clean_email text := nullif(lower(trim(coalesce(_email, ''))), '');
begin
  if nullif(trim(coalesce(_website, '')), '') is not null then
    return false;
  end if;

  if _form_started_at is null then
    return false;
  end if;

  if now() - _form_started_at < interval '3 seconds' then
    return false;
  end if;

  if now() - _form_started_at > interval '2 hours' then
    return false;
  end if;

  if clean_phone is null and clean_email is null then
    return false;
  end if;

  select count(*)
  into recent_count
  from public.leads
  where created_at > now() - interval '10 minutes'
    and (
      (clean_phone is not null and phone = clean_phone) or
      (clean_email is not null and lower(email) = clean_email)
    );

  return recent_count < 3;
end;
$$;

grant execute on function public.is_valid_public_lead(text, text, text, timestamptz) to anon, authenticated;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  service text not null check (service in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak')),
  rating int not null default 5 check (rating between 1 and 5),
  testimonial_date date,
  excerpt text not null,
  detail text not null,
  client_name text not null,
  location text,
  project_name text,
  image_url text,
  image_alt text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null,
  bio text,
  image_url text,
  image_alt text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'catalog_products_name_length') then
    alter table public.catalog_products add constraint catalog_products_name_length check (char_length(name) between 1 and 140);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'catalog_products_text_length') then
    alter table public.catalog_products add constraint catalog_products_text_length check (
      char_length(description) <= 3000 and
      char_length(material) <= 1600 and
      char_length(price_range) <= 120
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'catalog_products_safe_urls') then
    alter table public.catalog_products add constraint catalog_products_safe_urls check (
      (image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):') and
      (link_url is null or link_url !~* '^[[:space:]]*(javascript|data|vbscript):') and
      public.has_unsafe_url(images) = false
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'catalog_products_detail_text_length') then
    alter table public.catalog_products add constraint catalog_products_detail_text_length check (
      (product_code is null or char_length(product_code) <= 80) and
      (size is null or char_length(size) <= 220) and
      (finishing is null or char_length(finishing) <= 220) and
      (production_time is null or char_length(production_time) <= 160) and
      (packaging_installation is null or char_length(packaging_installation) <= 320) and
      (array_length(images, 1) is null or array_length(images, 1) <= 12)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'catalog_products_safe_gallery_urls') then
    alter table public.catalog_products add constraint catalog_products_safe_gallery_urls check (
      public.has_unsafe_url(images) = false
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'business_partners_text_length') then
    alter table public.business_partners add constraint business_partners_text_length check (
      char_length(name) between 1 and 140 and
      char_length(label) between 1 and 120 and
      (logo_alt is null or char_length(logo_alt) <= 180)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'business_partners_safe_urls') then
    alter table public.business_partners add constraint business_partners_safe_urls check (
      (logo_url is null or logo_url !~* '^[[:space:]]*(javascript|data|vbscript):') and
      (website_url is null or website_url !~* '^[[:space:]]*(javascript|data|vbscript):')
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'home_service_cards_required_fields') then
    alter table public.home_service_cards add constraint home_service_cards_required_fields check (
      char_length(title) between 1 and 140 and
      char_length(description) between 1 and 360 and
      (image_alt is null or char_length(image_alt) <= 180) and
      (display_number is null or display_number between 1 and 99)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'home_service_cards_safe_urls') then
    alter table public.home_service_cards add constraint home_service_cards_safe_urls check (
      (image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):') and
      (link_url is null or link_url !~* '^[[:space:]]*(javascript|data|vbscript):')
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_collection_items_required_fields') then
    alter table public.service_collection_items add constraint service_collection_items_required_fields check (
      service_category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak') and
      char_length(style_type) between 1 and 80 and
      char_length(title) between 1 and 140 and
      char_length(description) between 1 and 700 and
      (image_alt is null or char_length(image_alt) <= 180)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_collection_items_safe_image_url') then
    alter table public.service_collection_items add constraint service_collection_items_safe_image_url check (
      image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):'
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_feature_options_required_fields') then
    alter table public.service_feature_options add constraint service_feature_options_required_fields check (
      service_category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak') and
      (eyebrow is null or char_length(eyebrow) <= 80) and
      (feature_label is null or char_length(feature_label) <= 80) and
      char_length(title) between 1 and 140 and
      char_length(description) between 1 and 700 and
      (image_alt is null or char_length(image_alt) <= 180)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_feature_options_safe_image_url') then
    alter table public.service_feature_options add constraint service_feature_options_safe_image_url check (
      image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):'
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_faq_items_required_fields') then
    alter table public.service_faq_items add constraint service_faq_items_required_fields check (
      service_category in ('Kitchen Set', 'Lemari Custom', 'Kamar Interior', 'Kamar Anak') and
      char_length(question) between 1 and 220 and
      char_length(answer) between 1 and 1200
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_text_length') then
    alter table public.projects add constraint projects_text_length check (
      char_length(title) between 1 and 160 and
      (location is null or char_length(location) <= 160) and
      (area_scope is null or char_length(area_scope) <= 260) and
      (materials is null or char_length(materials) <= 320) and
      (testimonial_metric is null or char_length(testimonial_metric) <= 24) and
      (testimonial_metric_label is null or char_length(testimonial_metric_label) <= 120) and
      (testimonial_quote is null or char_length(testimonial_quote) <= 700) and
      (testimonial_client_name is null or char_length(testimonial_client_name) <= 140) and
      (testimonial_client_role is null or char_length(testimonial_client_role) <= 160)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_safe_image_url') then
    alter table public.projects add constraint projects_safe_image_url check (
      (image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):') and
      (testimonial_image_url is null or testimonial_image_url !~* '^[[:space:]]*(javascript|data|vbscript):')
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_testimonial_text_length') then
    alter table public.projects add constraint projects_testimonial_text_length check (
      (testimonial_metric is null or char_length(testimonial_metric) <= 24) and
      (testimonial_metric_label is null or char_length(testimonial_metric_label) <= 120) and
      (testimonial_quote is null or char_length(testimonial_quote) <= 700) and
      (testimonial_client_name is null or char_length(testimonial_client_name) <= 140) and
      (testimonial_client_role is null or char_length(testimonial_client_role) <= 160)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_safe_testimonial_image_url') then
    alter table public.projects add constraint projects_safe_testimonial_image_url check (
      testimonial_image_url is null or testimonial_image_url !~* '^[[:space:]]*(javascript|data|vbscript):'
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'testimonials_text_length') then
    alter table public.testimonials add constraint testimonials_text_length check (
      char_length(title) between 1 and 160 and
      char_length(excerpt) <= 600 and
      char_length(detail) <= 3000 and
      char_length(client_name) between 1 and 140
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'testimonials_safe_image_url') then
    alter table public.testimonials add constraint testimonials_safe_image_url check (
      image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):'
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'team_members_text_length') then
    alter table public.team_members add constraint team_members_text_length check (
      char_length(name) between 1 and 140 and
      char_length(role) between 1 and 140 and
      (bio is null or char_length(bio) <= 1000)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'team_members_safe_image_url') then
    alter table public.team_members add constraint team_members_safe_image_url check (
      image_url is null or image_url !~* '^[[:space:]]*(javascript|data|vbscript):'
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leads_text_length') then
    alter table public.leads add constraint leads_text_length check (
      char_length(name) between 1 and 140 and
      (phone is null or char_length(phone) <= 80) and
      (email is null or char_length(email) <= 160) and
      (message is null or char_length(message) <= 1600)
    );
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kediamanku-images',
  'kediamanku-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists catalog_products_category_idx on public.catalog_products (category);
create index if not exists catalog_products_published_idx on public.catalog_products (is_published);
create index if not exists catalog_products_sort_idx on public.catalog_products (sort_order, created_at desc);
create index if not exists business_partners_published_idx on public.business_partners (is_published);
create index if not exists business_partners_sort_idx on public.business_partners (sort_order, created_at asc);
create index if not exists home_service_cards_published_idx on public.home_service_cards (is_published);
create index if not exists home_service_cards_sort_idx on public.home_service_cards (sort_order, created_at asc);
create index if not exists service_collection_items_category_style_idx on public.service_collection_items (service_category, style_type);
create index if not exists service_collection_items_published_idx on public.service_collection_items (is_published);
create index if not exists service_collection_items_sort_idx on public.service_collection_items (sort_order, created_at asc);
create index if not exists service_feature_options_category_idx on public.service_feature_options (service_category);
create index if not exists service_feature_options_published_idx on public.service_feature_options (is_published);
create index if not exists service_feature_options_sort_idx on public.service_feature_options (service_category, sort_order, created_at asc);
create index if not exists service_faq_items_category_idx on public.service_faq_items (service_category);
create index if not exists service_faq_items_published_idx on public.service_faq_items (is_published);
create index if not exists service_faq_items_sort_idx on public.service_faq_items (service_category, sort_order, created_at asc);
create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_published_idx on public.projects (is_published);
create index if not exists projects_sort_idx on public.projects (sort_order, created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists testimonials_service_idx on public.testimonials (service);
create index if not exists testimonials_published_idx on public.testimonials (is_published);
create index if not exists testimonials_sort_idx on public.testimonials (sort_order, testimonial_date desc);
create index if not exists team_members_published_idx on public.team_members (is_published);
create index if not exists team_members_sort_idx on public.team_members (sort_order, created_at asc);

drop trigger if exists catalog_products_set_updated_at on public.catalog_products;
create trigger catalog_products_set_updated_at
before update on public.catalog_products
for each row execute function public.set_updated_at();

drop trigger if exists business_partners_set_updated_at on public.business_partners;
create trigger business_partners_set_updated_at
before update on public.business_partners
for each row execute function public.set_updated_at();

drop trigger if exists home_service_cards_set_updated_at on public.home_service_cards;
create trigger home_service_cards_set_updated_at
before update on public.home_service_cards
for each row execute function public.set_updated_at();

drop trigger if exists service_collection_items_set_updated_at on public.service_collection_items;
create trigger service_collection_items_set_updated_at
before update on public.service_collection_items
for each row execute function public.set_updated_at();

drop trigger if exists service_feature_options_set_updated_at on public.service_feature_options;
create trigger service_feature_options_set_updated_at
before update on public.service_feature_options
for each row execute function public.set_updated_at();

drop trigger if exists service_faq_items_set_updated_at on public.service_faq_items;
create trigger service_faq_items_set_updated_at
before update on public.service_faq_items
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.catalog_products enable row level security;
alter table public.business_partners enable row level security;
alter table public.home_service_cards enable row level security;
alter table public.service_collection_items enable row level security;
alter table public.service_feature_options enable row level security;
alter table public.service_faq_items enable row level security;
alter table public.projects enable row level security;
alter table public.leads enable row level security;
alter table public.testimonials enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read published catalog products" on public.catalog_products;
drop policy if exists "Admins can manage catalog products" on public.catalog_products;
create policy "Public can read published catalog products"
on public.catalog_products for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage catalog products"
on public.catalog_products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published business partners" on public.business_partners;
drop policy if exists "Admins can manage business partners" on public.business_partners;
create policy "Public can read published business partners"
on public.business_partners for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage business partners"
on public.business_partners for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published home service cards" on public.home_service_cards;
drop policy if exists "Admins can manage home service cards" on public.home_service_cards;
create policy "Public can read published home service cards"
on public.home_service_cards for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage home service cards"
on public.home_service_cards for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published service collection items" on public.service_collection_items;
drop policy if exists "Admins can manage service collection items" on public.service_collection_items;
create policy "Public can read published service collection items"
on public.service_collection_items for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage service collection items"
on public.service_collection_items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published service feature options" on public.service_feature_options;
drop policy if exists "Admins can manage service feature options" on public.service_feature_options;
create policy "Public can read published service feature options"
on public.service_feature_options for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage service feature options"
on public.service_feature_options for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published service FAQ items" on public.service_faq_items;
drop policy if exists "Admins can manage service FAQ items" on public.service_faq_items;
create policy "Public can read published service FAQ items"
on public.service_faq_items for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage service FAQ items"
on public.service_faq_items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published projects" on public.projects;
drop policy if exists "Admins can manage projects" on public.projects;
create policy "Public can read published projects"
on public.projects for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage projects"
on public.projects for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can submit leads" on public.leads;
drop policy if exists "Admins can view leads" on public.leads;
drop policy if exists "Admins can update leads" on public.leads;
drop policy if exists "Admins can delete leads" on public.leads;
create policy "Public can submit leads"
on public.leads for insert
to anon, authenticated
with check (public.is_valid_public_lead(phone, email, website, form_started_at));
create policy "Admins can view leads"
on public.leads for select
to authenticated
using (public.is_admin());
create policy "Admins can update leads"
on public.leads for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
create policy "Admins can delete leads"
on public.leads for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can read published testimonials" on public.testimonials;
drop policy if exists "Authenticated can manage testimonials" on public.testimonials;
drop policy if exists "Admins can manage testimonials" on public.testimonials;
create policy "Public can read published testimonials"
on public.testimonials for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage testimonials"
on public.testimonials for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published team members" on public.team_members;
drop policy if exists "Admins can manage team members" on public.team_members;
create policy "Public can read published team members"
on public.team_members for select
to anon, authenticated
using (is_published = true);
create policy "Admins can manage team members"
on public.team_members for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read Kediamanku images" on storage.objects;
drop policy if exists "Admins can upload Kediamanku images" on storage.objects;
drop policy if exists "Admins can update Kediamanku images" on storage.objects;
drop policy if exists "Admins can delete Kediamanku images" on storage.objects;

create policy "Public can read Kediamanku images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'kediamanku-images');

create policy "Admins can upload Kediamanku images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'kediamanku-images' and public.is_admin());

create policy "Admins can update Kediamanku images"
on storage.objects for update
to authenticated
using (bucket_id = 'kediamanku-images' and public.is_admin())
with check (bucket_id = 'kediamanku-images' and public.is_admin());

create policy "Admins can delete Kediamanku images"
on storage.objects for delete
to authenticated
using (bucket_id = 'kediamanku-images' and public.is_admin());

insert into public.business_partners (slug, name, label, sort_order, is_published)
values
  ('takeda', 'Takeda', 'Business Partner', 10, true),
  ('corporate-partner', 'Corporate Partner', 'Office Interior', 20, true),
  ('workspace-client', 'Workspace Client', 'Design & Build', 30, true),
  ('retail-partner', 'Retail Partner', 'Custom Interior', 40, true),
  ('residential-developer', 'Residential Developer', 'Interior Collaboration', 50, true),
  ('project-partner', 'Project Partner', 'Built-in Furniture', 60, true)
on conflict (slug) do nothing;

insert into public.home_service_cards (slug, title, description, image_url, image_alt, link_url, display_number, sort_order, is_published)
values
  ('home-kitchen-set', 'Kitchen Set', 'Custom cabinetry, storage, surfaces, and installation.', '/assets/images/hero-kitchen-living.webp', 'Warm premium kitchen set by Kediamanku', '/services/kitchen-set/', 1, 10, true),
  ('home-lemari-custom', 'Lemari Custom', 'Measured wardrobe systems for calm daily routines.', '/assets/images/custom-wardrobe.webp', 'Custom wardrobe with integrated lighting by Kediamanku', '/services/lemari-custom/', 2, 20, true),
  ('home-kamar-interior', 'Kamar Interior', 'Bedroom interiors shaped around comfort and storage.', '/assets/images/bedroom-interior.webp', 'Modern bedroom interior with refined panels by Kediamanku', '/services/kamar-interior/', 3, 30, true),
  ('home-kamar-anak', 'Kamar Anak', 'Safe, playful, and functional rooms for growing children.', '/assets/images/kids-bedroom.webp', 'Kids bedroom with custom storage and study area by Kediamanku', '/services/kamar-anak/', 4, 40, true)
on conflict (slug) do nothing;

insert into public.service_feature_options (slug, service_category, eyebrow, title, description, image_url, image_alt, sort_order, is_published)
values
  ('kitchen-set-custom-cabinets', 'Kitchen Set', 'Cabinetry', 'Custom Cabinets', 'Made-to-measure storage with clean panel proportion, soft-close hardware, and warm lighting options.', '/assets/images/hero-kitchen-living.webp', 'Kitchen cabinet option by Kediamanku', 10, true),
  ('kitchen-set-pantry-system', 'Kitchen Set', 'Storage', 'Pantry System', 'Tall cabinets, appliance towers, pull-out storage, and organized zones for everyday kitchen tools.', '/assets/images/custom-wardrobe.webp', 'Tall pantry and appliance storage inspiration by Kediamanku', 20, true),
  ('kitchen-set-countertop-light', 'Kitchen Set', 'Finishing', 'Countertop & Light', 'Material direction for countertop, backsplash, LED strips, display shelves, and premium warm ambience.', '/assets/images/bedroom-interior.webp', 'Warm material and lighting option for Kediamanku kitchen set', 30, true),
  ('lemari-custom-sliding-wardrobe', 'Lemari Custom', 'Door System', 'Sliding Wardrobe', 'Space-saving sliding panels with warm neutral finishing, mirror options, or smoked glass accents.', '/assets/images/custom-wardrobe.webp', 'Sliding wardrobe option by Kediamanku', 10, true),
  ('lemari-custom-walk-in-closet', 'Lemari Custom', 'Closet', 'Walk-in Closet', 'Open and closed zones for hanging, folding, accessories, bags, and dressing routines.', '/assets/images/bedroom-interior.webp', 'Walk-in closet planning by Kediamanku', 20, true),
  ('lemari-custom-drawer-system', 'Lemari Custom', 'Details', 'Drawer System', 'Internal drawers, dividers, display shelves, LED strips, and hardware selected for daily comfort.', '/assets/images/hero-kitchen-living.webp', 'Drawer and display lighting option by Kediamanku', 30, true),
  ('kamar-interior-headboard-panel', 'Kamar Interior', 'Feature Wall', 'Headboard Panel', 'Layered headboard, wall panel, LED detail, and material rhythm for a calm room anchor.', '/assets/images/bedroom-interior.webp', 'Custom bedroom headboard by Kediamanku', 10, true),
  ('kamar-interior-wardrobe-zone', 'Kamar Interior', 'Storage', 'Wardrobe Zone', 'Built-in wardrobe planning that keeps storage visually aligned with the bedroom mood.', '/assets/images/custom-wardrobe.webp', 'Bedroom wardrobe integration by Kediamanku', 20, true),
  ('kamar-interior-side-table-light', 'Kamar Interior', 'Details', 'Side Table & Light', 'Floating nightstands, warm lighting, soft materials, and practical bedside storage.', '/assets/images/hero-kitchen-living.webp', 'Warm lighting and side table option by Kediamanku', 30, true),
  ('kamar-anak-bed-frame', 'Kamar Anak', 'Sleep', 'Bed Frame', 'Custom bed frame with soft proportions, storage options, and child-friendly room composition.', '/assets/images/kids-bedroom.webp', 'Kids bed frame and storage by Kediamanku', 10, true),
  ('kamar-anak-study-desk', 'Kamar Anak', 'Study', 'Study Desk', 'Compact desk, shelves, cable planning, and lighting direction for daily learning routines.', '/assets/images/bedroom-interior.webp', 'Kids study desk and shelves by Kediamanku', 20, true),
  ('kamar-anak-toy-storage', 'Kamar Anak', 'Storage', 'Toy Storage', 'Closed and open storage for toys, books, bags, clothes, and display items.', '/assets/images/custom-wardrobe.webp', 'Kids storage wall by Kediamanku', 30, true)
on conflict (slug) do nothing;

insert into public.service_faq_items (slug, service_category, question, answer, sort_order, is_published)
values
  ('kitchen-set-project-timeline', 'Kitchen Set', 'How long does a kitchen set project take?', 'Timeline depends on size, material availability, and design complexity. After survey, we provide a clearer schedule for production and installation.', 10, true),
  ('kitchen-set-material-guidance', 'Kitchen Set', 'Can Kediamanku help choose materials?', 'Yes. We guide material, color, hardware, lighting, and finishing choices based on your style, durability needs, and budget.', 20, true),
  ('kitchen-set-measurement', 'Kitchen Set', 'Do you measure the kitchen area first?', 'Yes. A precise survey helps us check dimensions, wall condition, utility points, circulation, and installation requirements.', 30, true),
  ('lemari-custom-existing-room-size', 'Lemari Custom', 'Can the wardrobe follow an existing room size?', 'Yes. Every wardrobe is measured and produced according to the exact room width, height, and technical condition.', 10, true),
  ('lemari-custom-mirror-glass-doors', 'Lemari Custom', 'Can I mix mirror and glass doors?', 'Yes. We can combine solid panels, mirrors, smoked glass, display shelves, and lighting based on the design direction.', 20, true),
  ('lemari-custom-internal-modules', 'Lemari Custom', 'Do you help plan the internal modules?', 'Yes. We map hanging, folding, drawer, luggage, accessory, and display zones before production.', 30, true),
  ('kamar-interior-one-wall', 'Kamar Interior', 'Can you design only one bedroom wall?', 'Yes. We can focus on headboard and wall panel composition, or build a full room interior depending on your needs.', 10, true),
  ('kamar-interior-lighting', 'Kamar Interior', 'Can lighting be included?', 'Yes. We can plan warm LED details, display lighting, and practical bedside lighting direction.', 20, true),
  ('kamar-interior-wardrobe', 'Kamar Interior', 'Can wardrobe be included in the bedroom design?', 'Yes. Wardrobe integration is commonly included so storage and bedroom ambience feel consistent.', 30, true),
  ('kamar-anak-grow-with-child', 'Kamar Anak', 'Can the room grow with my child?', 'Yes. We can keep the base design timeless and use flexible storage, study, and display elements that remain useful over time.', 10, true),
  ('kamar-anak-study-toy-storage', 'Kamar Anak', 'Can you include study desk and toy storage?', 'Yes. Study desks, shelves, toy storage, wardrobe, and bed frame can be planned as one integrated room system.', 20, true),
  ('kamar-anak-safety-details', 'Kamar Anak', 'Do you consider safety details?', 'Yes. We discuss circulation, height, edge treatment, access, and practical daily use before production.', 30, true)
on conflict (slug) do nothing;

-- Replace the UID and email below after creating the admin account in Supabase Auth.
-- insert into public.admin_users (user_id, email)
-- values ('PASTE_AUTH_USER_ID_HERE', 'admin@kediamanku.com')
-- on conflict (user_id) do update set email = excluded.email;
