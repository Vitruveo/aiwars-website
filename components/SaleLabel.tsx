"use client";

import { useSaleOpen } from "@/lib/useSaleOpen";

/// Renders `open` when the sale is live on-chain, otherwise `closed`.
export default function SaleLabel({ open, closed }: { open: React.ReactNode; closed: React.ReactNode }) {
  const live = useSaleOpen();
  return <>{live ? open : closed}</>;
}
