"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

// Compact RainbowKit button for the nav. Shows the active network icon so a user on the
// wrong chain sees it at a glance; the mint panel switches networks when it needs to.
export default function WalletButton() {
  return (
    <ConnectButton
      label="Connect"
      chainStatus="icon"
      showBalance={false}
      accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
    />
  );
}
