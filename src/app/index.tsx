import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type VehicleType = "Motor" | "Mobil";

interface Vehicle {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly type: VehicleType;
  readonly price: number;
  readonly description: string;
  readonly imageUrl: string;
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function DealerKatalog() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const [catalogVehicles, setCatalogVehicles] = useState<Vehicle[]>([]);
  const [selectedType, setSelectedType] = useState<VehicleType | "Semua">(
    "Semua",
  );
  const [search, setSearch] = useState("");
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiError, setApiError] = useState("");
  const [totalVehicles, setTotalVehicles] = useState(0);
  const PAGE_SIZE = 40;

  const selectedVehicle =
    typeof vehicleId === "string"
      ? catalogVehicles.find((vehicle) => vehicle.id === vehicleId)
      : undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVehicles(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedType]);

  const loadVehicles = async (reset: boolean) => {
    const offset = reset ? 0 : catalogVehicles.length;
    if (!reset && (isLoadingMore || offset >= totalVehicles)) return;

    reset ? setIsLoadingVehicles(true) : setIsLoadingMore(true);
    setApiError("");

    try {
      let query = supabase
        .from("vehicles")
        .select(
          "id,name,brand,vehicle_type,price,description,image_url",
          { count: "exact" },
        )
        .order("external_id", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (selectedType !== "Semua") {
        query = query.eq("vehicle_type", selectedType);
      }

      const normalizedSearch = search.trim();
      if (normalizedSearch) {
        query = query.or(
          `name.ilike.%${normalizedSearch}%,brand.ilike.%${normalizedSearch}%`,
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const rows = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        type: row.vehicle_type as VehicleType,
        price: Number(row.price),
        description: row.description,
        imageUrl: row.image_url || "",
      }));

      setCatalogVehicles((current) => (reset ? rows : [...current, ...rows]));
      setTotalVehicles(count ?? 0);
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "";
      setApiError(
        detail
          ? `Gagal mengambil data: ${detail}`
          : "Terjadi kesalahan saat mengambil data kendaraan.",
      );
    } finally {
      reset ? setIsLoadingVehicles(false) : setIsLoadingMore(false);
    }
  };

  const returnToCatalog = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

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

  if (selectedVehicle) {
    return (
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          onPress={returnToCatalog}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹ Kembali ke katalog</Text>
        </Pressable>
        <Text style={styles.title}>{selectedVehicle.name}</Text>
        <Text style={styles.subtitle}>{selectedVehicle.brand}</Text>
        <View style={styles.card}>
          <Image
            source={{ uri: selectedVehicle.imageUrl }}
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.typeTag}>{selectedVehicle.type}</Text>
            <Text style={styles.description}>
              {selectedVehicle.description}
            </Text>
            <Text style={styles.price}>
              {formatRupiah(selectedVehicle.price)}
            </Text>
          </View>
        </View>
       <Pressable
          accessibilityRole="button"
          onPress={returnToCatalog}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹ KEMBALI KE DEMO </Text>
        </Pressable>
      </View>
      
    );
  }

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.vehicleName}>{item.name}</Text>
          </View>
          <Text style={styles.typeTag}>{item.type}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{formatRupiah(item.price)}</Text>
        <Pressable
          style={styles.detailButton}
          onPress={() =>
            router.push({ pathname: "/", params: { vehicleId: item.id } })
          }
        >
          <Text style={styles.detailButtonText}>Lihat detail</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.accountRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/dashboard")}
          style={styles.dashboardButton}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#b91c1c" size="small" />
          ) : (
            <Text style={styles.signOutText}>Keluar</Text>
          )}
        </Pressable>
      </View>
      {user?.email ? (
        <Text style={styles.accountEmail}>Masuk sebagai {user.email}</Text>
      ) : null}
      <Text style={styles.eyebrow}>DEALER KENDARAAN</Text>
      <Text style={styles.title}>Hantu Car</Text>
      <Text style={styles.subtitle}>Katalog motor dan mobil pilihan</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Cari nama atau merek kendaraan"
        placeholderTextColor="#94a3b8"
        style={styles.searchInput}
      />

      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

      <View style={styles.filterRow}>
        {(["Semua", "Motor", "Mobil"] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => setSelectedType(type)}
            style={[
              styles.filterButton,
              selectedType === type && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedType === type && styles.activeFilterText,
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.resultCount}>
        {isLoadingVehicles
          ? "Memuat kendaraan..."
          : `${totalVehicles.toLocaleString("id-ID")} kendaraan tersedia`}
      </Text>

      <FlatList
        data={catalogVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={() => loadVehicles(false)}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoadingVehicles ? (
            <ActivityIndicator color="#2563eb" size="large" style={styles.loading} />
          ) : (
            <Text style={styles.emptyText}>Kendaraan tidak ditemukan.</Text>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              color="#2563eb"
              size="small"
              style={styles.loadingMore}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    backgroundColor: "#f8fafc",
    paddingTop: 56,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: 760,
  },
  accountRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  accountEmail: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 10,
  },
  dashboardButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dashboardButtonText: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "800",
  },
  signOutButton: {
    alignItems: "center",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  signOutText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "800",
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 18,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 12,
    borderWidth: 1,
    color: "#0f172a",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  apiButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 10,
    marginTop: 12,
    paddingVertical: 12,
  },
  apiButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  apiResultText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 16,
  },
  filterButton: {
    borderColor: "#cbd5e1",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeFilterButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterText: {
    color: "#475569",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  list: {
    paddingBottom: 96,
  },
  resultCount: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  loading: {
    marginTop: 32,
  },
  loadingMore: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    backgroundColor: "#e2e8f0",
    height: 190,
    width: "100%",
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
  },
  brand: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  vehicleName: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 2,
  },
  typeTag: {
    backgroundColor: "#dbeafe",
    borderRadius: 6,
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  description: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  price: {
    color: "#0284c7",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },
  detailButton: {
    alignItems: "center",
    backgroundColor: "#090909",
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 12,
  },
  detailButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    color: "#64748b",
    paddingTop: 24,
    textAlign: "center",
  },
  backButton: {
    alignSelf: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#1058f2",
    fontSize: 16,
    fontWeight: "700",
  },
});