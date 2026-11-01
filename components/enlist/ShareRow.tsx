"use client";

import { useState } from "react";

// Share a survivor card: post to X, copy the link, or download the card image.
export default function ShareRow({ tokenId, name }: { tokenId: number; name: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}/enlist/${tokenId}`;
  const btn = "border border-hairline px-5 py-3 font-mono text-sm uppercase tracking-[0.25em] text-dim hover:border-signal hover:text-signal";
  return (
    <div className="mt-10 flex flex-wrap gap-3 border-t border-hairline pt-6">
      <button
        type="button"
        className={btn}
        onClick={() =>
          window.open(
            `https://x.com/intent/post?text=${encodeURIComponent(`${name} has enlisted in the Fall of Meridian. #AIWars`)}&url=${encodeURIComponent(url())}`,
            "_blank",
            "noopener"
          )
        }
      >
        Share on X
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          await navigator.clipboard.writeText(url()).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a href={`/enlist/${tokenId}/opengraph-image`} download={`survivor-${tokenId}.png`} className={btn}>
        Download card
      </a>
    </div>
  );
}
