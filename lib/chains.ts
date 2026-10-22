import { defineChain } from "viem";

// Vitruveo mainnet. Kept free of wallet/UI imports so server routes can use it.
export const vitruveo = defineChain({
  id: 1490,
  name: "Vitruveo",
  nativeCurrency: { name: "Vitruveo", symbol: "VTRU", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.vitruveo.ai"] } },
  blockExplorers: { default: { name: "Vitruveo Explorer", url: "https://explorer.vitruveo.ai" } },
});

// BNB Smart Chain, minimal definition. Importing from viem/chains drags every chain into the server bundle.
export const bscChain = defineChain({
  id: 56,
  name: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: { default: { http: ["https://bsc-dataseed.binance.org"] } },
  blockExplorers: { default: { name: "BscScan", url: "https://bscscan.com" } },
});
