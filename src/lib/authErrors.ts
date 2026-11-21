interface AuthErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Object)) {
    return "Terjadi kesalahan saat proses autentikasi.";
  }

  const authError = error as AuthErrorLike;
  const code = authError.code?.toLowerCase();
  const message = authError.message?.toLowerCase() ?? "";

  if (
    code === "over_email_send_rate_limit" ||
    code === "email_rate_limit_exceeded" ||
    message.includes("email rate limit") ||
    message.includes("rate limit") ||
    message.includes("email sent too quickly")
  ) {
    return "Pendaftaran ditolak oleh pengaturan email Supabase. Aktifkan pengaturan Email Auth yang sesuai untuk pengembangan atau produksi.";
  }

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Email atau password tidak valid.";
  }

  if (code === "user_already_exists" || message.includes("already registered")) {
    return "Email sudah terdaftar. Silakan masuk atau gunakan email lain.";
  }

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Buka tautan konfirmasi yang dikirim ke email Anda.";
  }

  return authError.message || "Terjadi kesalahan saat proses autentikasi.";
}
