export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is the Scape?",
    a: "The land around the Archive, cut into 5,000 sectors. One sector per Archive Shard. It is a window on the world, not the game itself: the game runs on its own engine, and the Scape is where holders can already see and mark the ground their shard is tied to.",
  },
  {
    q: "Which sector is mine?",
    a: "Your shard's tier decides the band, and the order it was minted in decides the place within it. Sectors 1 to 125 ring the Archive and belong to Archivists; Vanguard and Defender hold the districts and highlands beyond, Citizens the wastes, Survivors the haze at the margin from sector 2,251 out. Connect your wallet and your sectors are listed under the map.",
  },
  {
    q: "How do I look at other sectors?",
    a: "Click any tile on the world map, use the arrows or the number box under the sector name, or hit Random. Any sector can be flown by anyone. Lit tiles are minted; dark tiles are not yet claimed.",
  },
  {
    q: "Is a sector fixed, or generated fresh each time?",
    a: "Fixed. Everything in a sector is computed from its number and nothing else: the terrain, the biome, the structures, the name and the flight path. The same sector renders the same on every machine, every visit. Nothing is stored except beacons.",
  },
  {
    q: "What is the column of light in the middle?",
    a: "The sector's anchor. The shard itself hovers inside it, above the two landing rings at the exact centre of the sector. Ember for Archivist sectors, blue for the rest. The automatic flight circles it.",
  },
  {
    q: "What are the towers, pylons and rings?",
    a: "Machine-built geometry. Towers and slabs are what remains of Meridian's districts. Pylons are the machines' transmission masts. The floating rings are the same kind of structure that assembled over the city in the prologue, left behind and still powered. Wrecks are what fell.",
  },
  {
    q: "What are the glowing lines in the ground?",
    a: "Energy veins. The Archive draws power from something under the surface, and the closer a sector is to it the more of that network shows through the ground. Meridian's inner ring is laced with it; the haze margin barely glows.",
  },
  {
    q: "What is a beacon?",
    a: "One named point per sector, chosen by whoever holds that shard. Click the ground, give it a name, sign a message with your wallet. The site checks the signature and that your wallet holds the token on Vitruveo, then writes the beacon. It shows as a marker in the sector and as a white dot on the world map. The holder can move or rename it at any time.",
  },
  {
    q: "Does a beacon cost anything?",
    a: "No. Signing a message is free; nothing is sent on chain.",
  },
  {
    q: "What happens to the beacon if I sell the shard?",
    a: "It stays until the new holder changes it. Beacons belong to the sector, not the wallet.",
  },
  {
    q: "How do I fly it?",
    a: "It flies itself. Drag to take over and orbit, scroll to zoom, and after a few quiet seconds it eases back onto its loop. The icon top right goes fullscreen.",
  },
  {
    q: "Will the Scape change?",
    a: "The terrain will not. What appears on it will: beacons as holders name places, more lit tiles as tiers sell, and over time the features your shard's Scape activations unlock in the game.",
  },
];

export default function ScapeFaq() {
  return (
    <section className="mt-16">
      <p className="kicker mb-4">
        <span className="kicker-num">06</span>Questions
      </p>
      <h2 className="display text-3xl text-ink sm:text-4xl">About the Scape</h2>
      <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {FAQ.map(({ q, a }) => (
          <div key={q} className="border-t border-hairline pt-4">
            <dt className="display text-lg text-ink">{q}</dt>
            <dd className="mt-2 text-base text-dim">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
