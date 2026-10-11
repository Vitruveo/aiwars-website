import type { Abi, Address } from "viem";
import contracts from "@/data/aiwars-contracts.json";

// aiwars-contracts.json is written by the hardhat `deploy` + `sync-web` tasks.
// Addresses are absent until each contract is deployed; the UI falls back to "opening soon".
type ContractsFile = {
  bsc?: { ShardSale?: string; GenesisPass?: string };
  vitruveo?: { AIWarsNFT?: string };
  abi: { AIWarsNFT: Abi; ShardSale: Abi; GenesisPass?: Abi };
};
const file = contracts as unknown as ContractsFile;

export const SALE_ADDRESS = file.bsc?.ShardSale as Address | undefined;
export const NFT_ADDRESS = file.vitruveo?.AIWarsNFT as Address | undefined;
export const GENESIS_ADDRESS = file.bsc?.GenesisPass as Address | undefined;
export const SALE_ABI = file.abi.ShardSale;
export const NFT_ABI = file.abi.AIWarsNFT;
export const GENESIS_ABI = (file.abi.GenesisPass ?? []) as Abi;

// Vitruveo Bridged VTRU on BNB Smart Chain, 18 decimals. Must match GenesisPass.vtru().
export const VTRU_BSC: Address = "0xb08504D245713Ca9692C8fA605E76A0A11Ed4955";
export const VTRU_BRIDGE_URL = "https://scope.vitruveo.ai/bridge/vtru";
export const GENESIS_PRICE_VTRU = 45_000;
export const GENESIS_THRESHOLD = 20;
export const GENESIS_COMMISSION_PCT = 10;

// BEP-20 USDT on BNB Smart Chain, 18 decimals. Must match ShardSale.paymentToken().
export const USDT_BSC: Address = "0x55d398326f99059fF775485246999027B3197955";

export const ERC20_ABI = [
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;
