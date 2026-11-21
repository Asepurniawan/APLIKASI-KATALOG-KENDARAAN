import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

const USERS_API_URL = "https://jsonplaceholder.typicode.com/users";

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(USERS_API_URL);

  if (!response.ok) {
    throw new Error(`Gagal mengambil data pengguna (${response.status}).`);
  }

  return response.json() as Promise<User[]>;
};

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchUsers()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil data pengguna.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>‹ Kembali ke katalog</Text>
      </Pressable>
      <Text style={styles.eyebrow}>DATA PENGGUNA</Text>
      <Text style={styles.title}>Daftar Pengguna</Text>
      <Text style={styles.subtitle}>Data dari JSONPlaceholder API</Text>

      {isLoading ? (
        <ActivityIndicator color="#0f766e" size="large" style={styles.loading} />
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(user) => String(user.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 56,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backButtonText: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "700",
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    marginTop: 6,
  },
  loading: {
    marginTop: 40,
  },
  list: {
    gap: 12,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  name: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "700",
  },
  email: {
    color: "#0f766e",
    fontSize: 14,
    marginTop: 6,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    marginTop: 24,
  },
});
