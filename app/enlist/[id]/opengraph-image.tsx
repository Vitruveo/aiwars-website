import { ImageResponse } from "next/og";
import { getSurvivor, readPortrait } from "@/lib/enlist/db";

// The survivor card as a 1200x630 image: link previews on X and Discord, and the "Download card" button.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Wars survivor card";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const tokenId = Number((await params).id);
  const [s, webp] = await Promise.all([getSurvivor(tokenId).catch(() => null), readPortrait(tokenId, false).catch(() => null)]);
  // Satori cannot decode WebP, so the portrait goes in as PNG. Every text node must be a single string:
  // Satori rejects a div with several children unless it is display flex, and the response then drops.
  const sharp = webp ? (await import("sharp")).default : null;
  const png = webp && sharp ? `data:image/png;base64,${(await sharp(webp).resize(630, 630).png().toBuffer()).toString("base64")}` : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#04070d", color: "#eef3fb" }}>
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={png} width={630} height={630} alt="" />
        ) : (
          <div style={{ width: 630, height: 630, background: "#0a1120" }} />
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 52px", borderLeft: "2px solid #f0954f" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 6, color: "#f0954f", textTransform: "uppercase" }}>{`Survivor · Shard #${tokenId}`}</div>
            <div style={{ fontSize: s && s.name.length > 14 ? 56 : 72, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }}>{s?.name ?? "Not enlisted"}</div>
            {s?.epithet ? <div style={{ fontSize: 32, color: "#f0954f", marginTop: 12 }}>{s.epithet}</div> : null}
          </div>
          {s ? (
            <div style={{ display: "flex", flexDirection: "column", fontSize: 26, color: "#b9c5da", gap: 10 }}>
              <div style={{ display: "flex" }}>{`Tier ${String(s.tier).padStart(2, "0")} ${s.rank} · ${s.role}`}</div>
              <div style={{ display: "flex" }}>{s.origin}</div>
              <div style={{ display: "flex" }}>{`Home: ${s.sector}`}</div>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2, whiteSpace: "nowrap" }}>AI WARS</div>
            <div style={{ fontSize: 18, letterSpacing: 3, color: "#8fa0ba", textTransform: "uppercase", whiteSpace: "nowrap" }}>The Fall of Meridian</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
