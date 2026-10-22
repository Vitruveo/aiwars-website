// Shared between the signing client and the verifying route.
export function beaconMessage(tokenId: number, name: string, x: number, z: number, ts: number) {
  return `AI Wars Scape\nBeacon for sector ${tokenId}\nName: ${name}\nAt: ${x.toFixed(1)}, ${z.toFixed(1)}\nTime: ${ts}`;
}
