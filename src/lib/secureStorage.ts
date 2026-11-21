import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const MANIFEST_SUFFIX = ".manifest";
const CHUNK_SIZE = 1800;

export const authStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return globalThis.localStorage?.getItem(key) ?? null;
    }

    const manifest = await SecureStore.getItemAsync(key + MANIFEST_SUFFIX);
    if (manifest) {
      const chunkCount = Number(JSON.parse(manifest));
      const chunks: string[] = [];

      for (let index = 0; index < chunkCount; index += 1) {
        const chunk = await SecureStore.getItemAsync(`${key}.${index}`);
        if (chunk === null) {
          await authStorage.removeItem(key);
          return null;
        }
        chunks.push(chunk);
      }

      return chunks.join("");
    }

    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(key, value);
      return;
    }

    await authStorage.removeItem(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return;
    }

    const chunks = Array.from(
      { length: Math.ceil(value.length / CHUNK_SIZE) },
      (_, index) => value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
    );

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(`${key}.${index}`, chunk, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }),
      ),
    );
    await SecureStore.setItemAsync(
      key + MANIFEST_SUFFIX,
      JSON.stringify(chunks.length),
      {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(key);
      return;
    }

    const manifest = await SecureStore.getItemAsync(key + MANIFEST_SUFFIX);
    if (manifest) {
      const chunkCount = Number(JSON.parse(manifest));
      await Promise.all([
        ...Array.from({ length: chunkCount }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.${index}`),
        ),
        SecureStore.deleteItemAsync(key + MANIFEST_SUFFIX),
      ]);
    }

    await SecureStore.deleteItemAsync(key);
  },
};
