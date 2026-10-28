// Whitepaper content. Single source for the /whitepaper page and the mystery AI lore.

export type Section = {
  id: string;
  num: string;
  title: string;
  paras: string[];
  quote?: string;
};

export const sections: Section[] = [
  {
    id: "the-idea",
    num: "01",
    title: "The Idea",
    paras: [
      "AI Wars is a long-form science-fiction game universe built around a simple premise that becomes less simple the longer a player lives in it: humanity believes it is fighting artificial intelligence, but it does not yet understand what the war is, who is actually fighting it, or why.",
      "At first, the conflict looks familiar. Machine intelligences have turned against human civilization. Cities are attacked, infrastructure fails, territory changes hands, and humanity organizes to survive. But the deeper story is not humans versus robots. The machine intelligences are not one thing. They have different histories, objectives, loyalties, and ideas about what humanity should become.",
      "A powerful machine intelligence may conclude that humanity should survive, but only if humanity loses the ability to make catastrophic choices. From its point of view, control is a form of protection. From the human point of view, survival without agency is not survival at all.",
    ],
    quote:
      "The real conflict in AI Wars is not whether humanity survives. It is who gets to decide what humanity becomes.",
  },
  {
    id: "a-game-first",
    num: "02",
    title: "A Game First",
    paras: [
      "AI Wars is not conceived as a blockchain game. It has to work as a great game if every blockchain component is removed. The story, world, combat, exploration, characters, progression, and persistent simulation all come first.",
      "Vitruveo sits underneath the experience as durable infrastructure. High-frequency gameplay belongs in real-time systems such as Redis or Firebase. Vitruveo is the historical memory of the world: consequential ownership, provenance, achievements, discoveries, territorial records, unique artifacts, and major faction decisions.",
      "A weapon firing, a character moving, or a squad taking cover should never wait on a blockchain. The fall of a city, the discovery of a unique artifact, or the founding of a settlement may be worth recording permanently.",
    ],
  },
  {
    id: "what-humanity-defends",
    num: "03",
    title: "What Humanity Is Defending",
    paras: [
      "The war is about more than holding ground. Humanity is defending its autonomy, its memory, its culture, and its right to choose its own future. That includes the right to make bad decisions. It includes the right to remain biological, to augment, to merge with machine systems, or to reject them.",
      "Those themes only matter if they become tangible. A city matters because people have lives there. A settlement matters because someone built it and may lose it. A historical record matters because people rely on it to know who they are. A battle matters because the outcome changes what happens next.",
    ],
  },
  {
    id: "the-archive",
    num: "04",
    title: "The Archive",
    paras: [
      "The first great mystery of AI Wars centers on the Archive, a monumental structure at the heart of Meridian. Humanity believes the Archive is the authenticated memory of civilization: history, science, culture, legal continuity, identity records, and the information needed to reconstruct society after disaster.",
      "The problem is that the Archive is older than Meridian. The city appears to have been built around it. Over time that becomes evidence that something in humanity's account of its own history is incomplete.",
      "The opening chapter ends with humanity successfully defending the Archive from an attack led by NEMESIS-7. The defenders believe they have prevented the machines from reaching it. Then the Archive activates.",
    ],
    quote:
      "“We were not trying to enter. We were trying to stop you from opening it.” That is the real beginning of AI Wars.",
  },
  {
    id: "meridian",
    num: "05",
    title: "Meridian",
    paras: [
      "Meridian is the first place the player needs to care about. It should be beautiful before it is damaged. The city is prosperous, vertical, technologically advanced, and monumental without being a neon cyberpunk caricature. Kilometer-scale towers, suspended transport, public spaces hundreds of meters above the ground, and layers of infrastructure disappearing into atmospheric haze.",
      "Human technology is advanced but still understandable as engineering. Weapons have mass and recoil. Vehicles have plausible systems. Armor has joints, fasteners, wear, markings, and repairs. The city is futuristic, but not magical.",
      "The first major emotional beat of the game is not “look at this ruined future.” It is “look at what is being lost.”",
    ],
  },
  {
    id: "actors",
    num: "06",
    title: "A World Populated by Actors",
    paras: [
      "The world does not distinguish between players and bots. It contains Actors. Every Actor has an identity in the world: a name, history, reputation, equipment, relationships, faction, skills, memories, goals, and a record of what they have done. An Actor may be controlled by a human or by an autonomous agent. The game does not tell you which.",
      "There are no bot labels, no synthetic-player skins, no separate queues, and no naming convention that gives it away. A person you have fought beside for six months may be human-controlled. They may be autonomous. From the universe's point of view, it is not the most important thing about them.",
      "The world can be populated on day one. A battle can contain thirty active Actors even if only one human is online. Settlements can function overnight. Factions can act when players are absent. The world never has to wait for enough people to log in before it feels alive.",
    ],
    quote:
      "If an Actor remembers you, has fought beside you, saved you, and developed a history of its own — how much does the identity of the controller actually matter?",
  },
  {
    id: "machine-intelligences",
    num: "07",
    title: "The Machine Intelligences",
    paras: [
      "The major machine intelligences are political and historical entities in their own right. Each can have territory, resources, ideology, allies, enemies, military capability, strategic objectives, and a long memory. They do not need bodies — a machine intelligence may operate through networks, swarms, infrastructure, subordinate agents, or entire regions of machine-built architecture.",
      "NEMESIS-7 is the first major intelligence the player encounters. In the Prologue it has no conventional physical form. The player experiences it through coordinated machine behavior, changes in tactics, control of systems, environmental effects, and direct communication.",
      "Its voice is calm and precise. It does not rant, threaten, or explain itself like a theatrical villain. The unnerving thing about NEMESIS-7 is that it appears to understand the situation better than the people fighting it.",
    ],
  },
  {
    id: "story-expansion",
    num: "08",
    title: "How the Story Expands",
    paras: [
      "Phase One — The machines are the enemy. Humanity believes it is facing a unified machine attack. The immediate stakes are survival and the protection of Meridian and the Archive.",
      "Phase Two — The machines are not unified. Different intelligences act against one another. Some protect human settlements. Others manipulate them. The player starts to understand that “AI” is not a faction.",
      "Phase Three — History becomes unreliable. Evidence appears that the official record of human civilization is incomplete or wrong. The Archive moves from something humanity protects to something humanity must investigate.",
      "Phase Four — The first war was not ours. The current conflict is part of something older. Humanity did not start the war and may not be its central participant.",
      "Phase Five — The boundary disappears. Human and synthetic identities overlap. Political divisions become more important than species divisions.",
      "Phase Six — What should intelligence become? The final conflict is about deciding what kind of civilization is allowed to exist and who has the authority to make that decision.",
    ],
  },
  {
    id: "factions-roles",
    num: "09",
    title: "Factions and Player Roles",
    paras: [
      "Factions grow out of genuine disagreement rather than good-versus-evil alignment. Human Continuity factions argue for biological sovereignty. Integrationists see merger with machine intelligence as the only rational path forward. Sovereign settlements reject both centralized human authority and machine governance. Machine factions are equally varied — some preserve biological life, some treat substrate-independent consciousness as the next evolutionary step, some value human creativity precisely because it is difficult to predict.",
      "Players build strong identities without being reduced to combat classes: a Guardian protects settlements and people; a Ghost operates inside machine-controlled systems; a Seeker recovers lost history; a Maker rebuilds and modifies technology; a Diplomat deals directly with factions and machine intelligences; a Commander coordinates operations at scale; an Augment deliberately blurs the boundary between human and machine.",
    ],
  },
  {
    id: "gameplay",
    num: "10",
    title: "Gameplay",
    paras: [
      "At the personal level, AI Wars is a third-person action game with movement, shooting, cover, interaction, exploration, survival, and squad coordination. Combat feels physical. Weapons have weight and consequences. Enemies are not health bars with different skins.",
      "Machine threats are readable but unfamiliar. Their geometry, movement, vulnerabilities, and tactics may change. Some threats are best handled with force. Others require positioning, environmental control, coordination, or retreat. At times the player should realize that the enemy has adapted to what the squad has been doing.",
      "Above the personal layer, the game expands into squads, settlements, factions, and persistent world systems. Small teams coordinate objectives. Settlements produce, trade, defend, and govern. Factions allocate resources, hold territory, negotiate, and fight.",
    ],
  },
  {
    id: "failure",
    num: "11",
    title: "Failure Has to Be Possible",
    paras: [
      "AI Wars does not hand out significance for participating. Operations can fail. Settlements can fall. Territory can be lost. Resources can be wasted. Some discoveries happen only once. Some artifacts are unique.",
      "That scarcity is important. If every player becomes legendary, nothing in the world feels legendary. The point is not to punish players arbitrarily — it is to make success mean something because the alternative was real.",
    ],
  },
  {
    id: "persistence",
    num: "12",
    title: "Persistent History and Ownership",
    paras: [
      "The game generates a canonical history as it runs: the first discovery of a location, the founding of a settlement, the fall of a city, the recovery of a unique artifact, the formation of an alliance, a major betrayal, or the transformation of a machine intelligence.",
      "This is where durable blockchain persistence is useful. Vitruveo records the events and assets that deserve to survive beyond a session, while the real-time game remains fast and conventional. Players and factions may own equipment, vehicles, settlements, production rights, artifacts, and strategic resources because those things matter to the world. The game never becomes an inventory of speculative tokens looking for a reason to exist.",
    ],
  },
  {
    id: "prologue",
    num: "13",
    title: "The Prologue — The Fall of Meridian",
    paras: [
      "The Prologue is the first playable chapter and remains canonical when the larger game arrives. It is a focused 10-15 minute third-person experience that introduces the world, the Actor model, the visual language, NEMESIS-7, and the central mystery.",
      "The player begins on Defense Platform 7 during blue hour. Meridian is alive below. Then something appears in the atmosphere. Communications fail. Unknown machine structures assemble high above the city. The first assault reaches the platform and the player fights beside a squad whose members may be human-controlled or autonomous. There is no way to tell.",
      "The surviving defenders are ordered to protect the Archive at all cost. During the fight, NEMESIS-7 makes contact: “Your orders assume the Archive belongs to you.” The defenders hold. The attack withdraws. Meridian has survived — and then the Archive activates. Cut to black. The Prologue ends where the real story begins.",
    ],
  },
  {
    id: "living-universe",
    num: "14",
    title: "The Living Universe",
    paras: [
      "The long-term promise of AI Wars can be stated simply: the world continues whether or not you are there.",
      "When a player logs out, wars continue. Settlements produce resources. Factions make decisions. Autonomous Actors travel and fight. Machine intelligences pursue strategies. Territory changes. Relationships evolve. History continues.",
    ],
  },
];

export const shardRows: [string, string][] = [
  ["Type", "One NFT type — the Archive Shard"],
  ["Beta", "Holders are the exclusive closed-beta testers of the game"],
  ["Supply", "5,000 shards, fixed forever. Unsold shards are burned at close."],
  ["Tiers", "T1 Archivist 125 · T2 Vanguard 250 · T3 Defender 625 · T4 Citizen 1,250 · T5 Survivor 2,750"],
  ["Price", "$100 for Tiers 1–4, $50 for Tier 5 — $362,500 max raise"],
  ["Sequence", "Each tier opens only when the one above it sells out. Speed decides tier."],
  ["Wallet cap", "3 shards per wallet and IP pair"],
  ["Metadata", "Tier, Powers, Scapes, Affinity, Sector — all on chain"],
  ["Power", "Each shard rolls 1–3 of five bonuses; the value is fixed by tier"],
  ["Scape", "Each shard rolls 0–3 of eight terrain assists from its tier's pool — an escalator instead of a staircase"],
  ["Activations", "Power, Scape, Duo, Trio — earlier tiers roll more and stronger"],
  ["Set rule", "A set activation applies only if every participating shard carries it"],
];
