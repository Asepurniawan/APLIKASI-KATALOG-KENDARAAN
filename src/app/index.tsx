import { useMemo, useState } from "react";
import {
  Alert,
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

const vehicles: Vehicle[] = [
  {
    id: "m1",
    name: "Honda CBR150R",
    brand: "Honda",
    type: "Motor",
    price: 37900000,
    description: "Motor sport full-fairing untuk penggunaan harian.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2021_Honda_CBR150R_ABS.jpg?width=1200",
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
  const [selectedType, setSelectedType] = useState<VehicleType | "Semua">(
    "Semua",
  );
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesType =
        selectedType === "Semua" || vehicle.type === selectedType;
      const matchesSearch =
        !normalizedSearch ||
        `${vehicle.brand} ${vehicle.name}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [search, selectedType]);

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
            Alert.alert(
              item.name,
              `${item.description}\n\nHarga mulai: ${formatRupiah(item.price)}`,
            )
          }
        >
          <Text style={styles.detailButtonText}>Lihat spesifikasi</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hantu Car</Text>
      <Text style={styles.subtitle}>Katalog motor dan mobil pilihan</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Cari nama atau merek kendaraan"
        placeholderTextColor="#94a3b8"
        style={styles.searchInput}
      />

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
    backgroundColor: "#f8fafc",
    paddingTop: 56,
    paddingHorizontal: 16,
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
    paddingBottom: 24,
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
    backgroundColor: "#2563eb",
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
});