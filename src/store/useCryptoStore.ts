import { create } from "zustand";

interface CryptoState {
  algorithm: "AES" | "RSA" | "HASH";
  mode: string;
  keySize: number;
  setAlgorithm: (algo: "AES" | "RSA" | "HASH") => void;
  setMode: (mode: string) => void;
  setKeySize: (size: number) => void;
}

export const useCryptoStore = create<CryptoState>((set) => ({
  algorithm: "AES",
  mode: "CBC",
  keySize: 128,
  setAlgorithm: (algorithm) => set({ algorithm }),
  setMode: (mode) => set({ mode }),
  setKeySize: (keySize) => set({ keySize }),
}));
