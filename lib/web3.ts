import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc } from "wagmi/chains";
import { defineChain } from "viem";

// Two networks. Payment (USDT) happens on BNB Smart Chain; the NFT lives on Vitruveo.
export const vitruveo = defineChain({
  id: 1490,
  name: "Vitruveo",
  nativeCurrency: { name: "Vitruveo", symbol: "VTRU", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.vitruveo.ai"] } },
  blockExplorers: { default: { name: "Vitruveo Explorer", url: "https://explorer.vitruveo.xyz" } },
});

export const PAY_CHAIN = bsc;
export const NFT_CHAIN = vitruveo;

// WalletConnect project id from https://cloud.walletconnect.com. Injected wallets (MetaMask, Rabby,
// Coinbase extension) work without it; WalletConnect QR pairing needs a real id.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AI Wars",
  projectId,
  chains: [bsc, vitruveo],
  ssr: true,
});
