import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

interface ExternalVehicle {
  readonly id: number;
  readonly title: string;
  readonly brand?: string;
  readonly category: "vehicle" | "motorcycle";
  readonly price: number;
  readonly description: string;
  readonly images?: readonly string[];
  readonly thumbnail: string;
}

interface ExternalVehicleResponse {
  readonly products: ExternalVehicle[];
}

const EXTERNAL_VEHICLE_APIS = [
  "https://dummyjson.com/products/category/vehicle?limit=0",
  "https://dummyjson.com/products/category/motorcycle?limit=0",
] as const;
const USD_TO_IDR_DEMO = 16000;

const validateApiResponse = (response: Response): Promise<Response> =>
  response.ok
    ? Promise.resolve(response)
    : Promise.reject(
        new Error(`API gagal merespons dengan status ${response.status}.`),
      );

const fetchExternalVehicles = async (): Promise<Vehicle[]> => {
  const responses = await Promise.all(
    EXTERNAL_VEHICLE_APIS.map((url) =>
      fetch(url).then(validateApiResponse),
    ),
  );
  const categoryResults = await Promise.all(
    responses.map(
      (response) =>
        response.json() as Promise<ExternalVehicleResponse>,
    ),
  );

  return categoryResults.flatMap(({ products }) =>
    products.map((product) => ({
      id: `external-${product.id}`,
      name: product.title,
      brand: product.brand || "Merek tidak diketahui",
      type: product.category === "motorcycle" ? "Motor" : "Mobil",
      price: Math.round(product.price * USD_TO_IDR_DEMO),
      description: product.description,
      imageUrl: product.images?.find(Boolean) || product.thumbnail,
    })),
  );
};

const vehicles: Vehicle[] = [
  {
    id: "m1",
    name: "Honda CBR150R",
    brand: "Honda",
    type: "Motor",
    price: 37900000,
    description: "Motor sport full-fairing untuk penggunaan hari.",
    imageUrl:
      "https://otomotifnet.gridoto.com/read/231124288/first-ride-all-new-honda-cbr150r-ini-daftar-kelebihannya",
  },
  {
    id: "m2",
    name: "Yamaha NMAX",
    brand: "Yamaha",
    type: "Motor",
    price: 32700000,
    description: "Skuter premium dengan posisi berkendara yang santai.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2020_Yamaha_NMAX_155_ABS_%2820200810%29_01.jpg?width=1200",
  },
  {
    id: "m3",
    name: "Kawasaki Ninja 250",
    brand: "Kawasaki",
    type: "Motor",
    price: 66000000,
    description: "Motor sport fairing dengan karakter berkendara sporty.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Kawasaki_Ninja250.JPG?width=1200",
  },
  {
    id: "m4",
    name: "Vespa Primavera",
    brand: "Vespa",
    type: "Motor",
    price: 53500000,
    description: "Skuter bergaya klasik dengan sentuhan modern.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/08-2024_Vespa_Primavera_Alter-Markt_Potsdam.jpg?width=1200",
  },
  {
    id: "c1",
    name: "Honda Civic",
    brand: "Honda",
    type: "Mobil",
    price: 699000000,
    description: "Sedan modern dengan desain tegas dan kabin nyaman.",
    imageUrl:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "c2",
    name: "Toyota GR Supra",
    brand: "Toyota",
    type: "Mobil",
    price: 2200000000,
    description: "Sport coupe dengan fokus pada performa.",
    imageUrl:
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "c3",
    name: "Mitsubishi Pajero Sport",
    brand: "Mitsubishi",
    type: "Mobil",
    price: 570000000,
    description: "SUV berpostur tinggi untuk keluarga dan perjalanan jauh.",
    imageUrl:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "c4",
    name: "BMW 3 Series",
    brand: "BMW",
    type: "Mobil",
    price: 1000000000,
    description: "Sedan premium dengan fitur kenyamanan modern.",
    imageUrl:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85",
  },
];

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function DealerKatalog() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const [catalogVehicles, setCatalogVehicles] = useState(vehicles);
  const [selectedType, setSelectedType] = useState<VehicleType | "Semua">(
    "Semua",
  );
  const [search, setSearch] = useState("");
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loadedExternalCounts, setLoadedExternalCounts] = useState<{
    cars: number;
    motorcycles: number;
  } | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredVehicles = catalogVehicles.filter((vehicle) => {
    const matchesType =
      selectedType === "Semua" || vehicle.type === selectedType;
    const matchesSearch =
      !normalizedSearch ||
      `${vehicle.brand} ${vehicle.name}`
        .toLowerCase()
        .includes(normalizedSearch);
    return matchesType && matchesSearch;
  });

  const selectedVehicle =
    typeof vehicleId === "string"
      ? catalogVehicles.find((vehicle) => vehicle.id === vehicleId)
      : undefined;

  const loadExternalVehicles = () => {
    setIsLoadingExternal(true);
    setApiError("");

    fetchExternalVehicles()
      .then((externalVehicles) => {
        setCatalogVehicles((currentVehicles) => [
          ...currentVehicles.filter(
            (vehicle) => !vehicle.id.startsWith("external-"),
          ),
          ...externalVehicles,
        ]);
        setLoadedExternalCounts({
          cars: externalVehicles.filter((vehicle) => vehicle.type === "Mobil")
            .length,
          motorcycles: externalVehicles.filter(
            (vehicle) => vehicle.type === "Motor",
          ).length,
        });
      })
      .catch((error: unknown) => {
        setApiError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil data kendaraan.",
        );
      })
      .finally(() => setIsLoadingExternal(false));
  };

  const returnToCatalog = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
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

      <Pressable
        accessibilityRole="button"
        disabled={isLoadingExternal}
        onPress={loadExternalVehicles}
        style={styles.apiButton}
      >
        <Text style={styles.apiButtonText}>
          {isLoadingExternal
            ? "Mengambil data mobil & motor..."
            : "Muat semua mobil & motor dari API"}
        </Text>
      </Pressable>
      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
      {loadedExternalCounts ? (
        <Text style={styles.apiResultText}>
          {loadedExternalCounts.cars} mobil dan{" "}
          {loadedExternalCounts.motorcycles} motor dari API berhasil dimuat.
        </Text>
      ) : null}

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
        {filteredVehicles.length} kendaraan tersedia
      </Text>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Kendaraan tidak ditemukan.</Text>
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
