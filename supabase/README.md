# Dataset Supabase

Migration: `migrations/20261121184900_seed_large_dataset.sql`

Migration ini membuat dan mengisi:

- `public.vehicles`: minimal 100.000 baris fiktif
- `public.profiles`: minimal 100.000 baris fiktif

## Menjalankan migration

1. Buka Supabase Dashboard proyek.
2. Buka **SQL Editor**.
3. Tempel dan jalankan isi migration.
4. Verifikasi jumlah baris:

```sql
select 'vehicles' as table_name, count(*) from public.vehicles
union all
select 'profiles', count(*) from public.profiles;
```
