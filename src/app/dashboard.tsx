import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      Alert.alert("Berhasil", "Anda berhasil keluar.");
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Gagal keluar",
        error instanceof Error ? error.message : "Terjadi kesalahan.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>AREA PRIVAT</Text>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? "-"}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>Aktif</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/users")}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Lihat daftar pengguna</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/")}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Ke katalog</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={isSigningOut}
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        {isSigningOut ? (
          <ActivityIndicator color="#b91c1c" />
        ) : (
          <Text style={styles.signOutText}>Keluar</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: "center", backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingTop: 56, width: "100%", maxWidth: 760 },
  eyebrow: { color: "#2563eb", fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: "#0f172a", fontSize: 30, fontWeight: "800", marginBottom: 18, marginTop: 6 },
  card: { backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: 16, borderWidth: 1, padding: 16 },
  label: { color: "#64748b", fontSize: 12, fontWeight: "700", marginTop: 8 },
  value: { color: "#0f172a", fontSize: 16, fontWeight: "700", marginTop: 4 },
  status: { alignSelf: "flex-start", backgroundColor: "#dcfce7", borderRadius: 6, color: "#166534", fontSize: 13, fontWeight: "800", marginTop: 4, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4 },
  primaryButton: { alignItems: "center", backgroundColor: "#2563eb", borderRadius: 10, marginTop: 16, paddingVertical: 12 },
  primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: "#cbd5e1", borderRadius: 10, borderWidth: 1, marginTop: 10, paddingVertical: 12 },
  secondaryButtonText: { color: "#334155", fontSize: 14, fontWeight: "800" },
  signOutButton: { alignItems: "center", borderColor: "#fecaca", borderRadius: 10, borderWidth: 1, marginTop: 10, paddingVertical: 12 },
  signOutText: { color: "#b91c1c", fontSize: 14, fontWeight: "800" },
});
