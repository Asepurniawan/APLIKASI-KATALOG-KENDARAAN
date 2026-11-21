# Konfigurasi tanpa pembatasan email untuk pengembangan

Pengaturan email limit bersifat server-side di Supabase dan tidak dapat dinonaktifkan oleh kode Expo.

Untuk pengembangan:

1. Buka Supabase Dashboard.
2. Pilih **Authentication → Providers → Email**.
3. Nonaktifkan **Confirm email** agar akun dapat dibuat tanpa pengiriman email konfirmasi.
4. Simpan perubahan.

Untuk produksi:

- Gunakan SMTP kustom dengan penyedia email yang memiliki limit tinggi.
- Tetap aktifkan konfirmasi email untuk keamanan.
- Atur domain dan sender yang valid pada **Authentication → SMTP Settings**.

Jangan pernah menaruh `service_role key` di aplikasi Expo atau `.env` klien.
