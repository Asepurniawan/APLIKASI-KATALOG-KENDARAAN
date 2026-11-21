create extension if not exists pgcrypto;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  external_id bigint not null unique,
  name text not null,
  brand text not null,
  vehicle_type text not null check (vehicle_type in ('Motor', 'Mobil')),
  price bigint not null check (price >= 0),
  description text not null,
  image_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  external_id bigint not null unique,
  name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists vehicles_brand_idx on public.vehicles (brand);
create index if not exists vehicles_type_idx on public.vehicles (vehicle_type);
create index if not exists profiles_email_idx on public.profiles (email);

alter table public.vehicles enable row level security;
alter table public.profiles enable row level security;

grant select on table public.vehicles to anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "Authenticated users can read vehicles" on public.vehicles;
create policy "Authenticated users can read vehicles"
  on public.vehicles for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

insert into public.vehicles (
  id,
  external_id,
  name,
  brand,
  vehicle_type,
  price,
  description,
  image_url
)
select
  ('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  i,
  (array['Sport', 'Scooter', 'Sedan', 'SUV', 'Coupe', 'Classic'])[1 + (i % 6)]
    || ' Demo '
    || lpad(i::text, 6, '0'),
  (array['Honda', 'Yamaha', 'Toyota', 'Kawasaki', 'BMW', 'Mitsubishi', 'Vespa'])[1 + (i % 7)],
  case when i % 2 = 0 then 'Motor' else 'Mobil' end,
  15000000::bigint
    + ((i::bigint * 1370000::bigint) % 2200000000::bigint),
  'Data kendaraan fiktif nomor ' || i || ' untuk pengujian katalog dan performa.',
  case
    when i % 2 = 0 then
      case i % 7
        when 0 then 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 1 then 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 2 then 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 3 then 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 4 then 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 5 then 'https://images.unsplash.com/photo-1524591652733-73fa1ae7ec1f?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        else 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
      end
    else
      case i % 7
        when 0 then 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 1 then 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 2 then 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 3 then 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 4 then 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 5 then 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        else 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85&vehicle=car'
      end
  end
from generate_series(1, 100000) as i
on conflict (external_id) do update set
  name = excluded.name,
  brand = excluded.brand,
  vehicle_type = excluded.vehicle_type,
  price = excluded.price,
  description = excluded.description,
  image_url = excluded.image_url;

insert into public.profiles (
  id,
  external_id,
  name,
  email,
  is_active
)
select
  ('10000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  i,
  'Pengguna Demo ' || lpad(i::text, 6, '0'),
  'pengguna' || i || '@example.test',
  i % 10 <> 0
from generate_series(1, 100000) as i
on conflict (external_id) do update set
  name = excluded.name,
  email = excluded.email,
  is_active = excluded.is_active;
