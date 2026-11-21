import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/authErrors";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    const normalizedEmail = email.trim();
    setErrorMessage("");

    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage("Masukkan alamat email yang valid.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(normalizedEmail, password);
      Alert.alert("Berhasil", "Anda berhasil masuk.");
      router.replace("/");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>HANTU CAR</Text>
        <Text style={styles.title}>Masuk</Text>
        <Text style={styles.subtitle}>Masuk untuk mengakses katalog kendaraan.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="nama@email.com"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="Minimal 6 karakter"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={handleSignIn}
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Masuk</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/register")}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Belum punya akun? Daftar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: 16 },
  card: { width: "100%", maxWidth: 420, backgroundColor: "#ffffff", borderRadius: 18, borderColor: "#e2e8f0", borderWidth: 1, padding: 20 },
  eyebrow: { color: "#2563eb", fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: "#0f172a", fontSize: 30, fontWeight: "800", marginTop: 6 },
  subtitle: { color: "#64748b", fontSize: 14, marginBottom: 20, marginTop: 4 },
  label: { color: "#334155", fontSize: 13, fontWeight: "700", marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: 10, borderWidth: 1, color: "#0f172a", paddingHorizontal: 12, paddingVertical: 12 },
  errorText: { color: "#b91c1c", fontSize: 13, marginTop: 12 },
  primaryButton: { alignItems: "center", backgroundColor: "#2563eb", borderRadius: 10, marginTop: 18, paddingVertical: 13 },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  linkButton: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  linkText: { color: "#0f766e", fontSize: 14, fontWeight: "700" },
});
