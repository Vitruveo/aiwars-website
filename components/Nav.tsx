"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import WalletButton from "@/components/WalletButton";
import { TRENDS_URL } from "@/components/TrendsBanner";

type Link = { href: string; label: string; children?: { href: string; label: string }[] };

const links: Link[] = [
  { href: "/#universe", label: "Universe" },
  { href: "/nft", label: "Shards" },
  { href: TRENDS_URL, label: "Trends" },
  { href: "/scape", label: "Scape" },
  // Roadmap (/roadmap, built but hidden) and Cost join Whitepaper here when they go live.
  { href: "/whitepaper", label: "Blueprint", children: [{ href: "/whitepaper", label: "Whitepaper" }] },
];

const linkClass =
  "relative font-mono text-base uppercase tracking-[0.25em] text-dim transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-300 hover:text-signal hover:after:scale-x-100";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Close the mobile menu on resize past the breakpoint and on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-hairline bg-abyss/85 backdrop-blur-md"
          : "border-b border-transparent bg-abyss/50 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="/" aria-label="AI Wars home" className="text-ink transition-colors hover:text-signal">
          <Logo className="text-2xl" />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.children ? (
              <div key={l.label} className="group relative flex h-16 items-center">
                <a href={l.href} className={linkClass} aria-haspopup="true">
                  {l.label}
                  <span aria-hidden="true" className="ml-2 inline-block text-xs text-faint transition-transform group-hover:rotate-180 group-focus-within:rotate-180">
                    &#9662;
                  </span>
                </a>
                <div className="invisible absolute left-0 top-full min-w-48 -translate-y-1 border border-hairline bg-abyss/95 opacity-0 shadow-[0_20px_50px_rgba(4,7,13,0.7)] backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {l.children.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      className="block whitespace-nowrap px-5 py-3 font-mono text-base uppercase tracking-[0.25em] text-dim transition-colors hover:bg-signal/10 hover:text-signal"
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </a>
            )
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/mint"
            className="hidden border border-signal/50 bg-signal/10 px-4 py-2 font-mono text-base uppercase tracking-[0.25em] text-signal transition-all hover:border-signal hover:bg-signal/20 sm:block"
          >
            Mint&nbsp;Shards
          </a>
          <WalletButton />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center border border-hairline text-ink transition-colors hover:border-signal hover:text-signal md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="border-t border-hairline bg-abyss/95 backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
            {links.map((l) => (
              <div key={l.label} className="border-b border-hairline/60 last:border-b-0">
                <a href={l.href} onClick={() => setOpen(false)} className="block py-4 font-mono text-lg uppercase tracking-[0.25em] text-ink transition-colors hover:text-signal">
                  {l.label}
                </a>
                {l.children?.map((c) => (
                  <a key={c.href} href={c.href} onClick={() => setOpen(false)} className="block py-3 pl-6 font-mono text-base uppercase tracking-[0.25em] text-dim transition-colors hover:text-signal">
                    {c.label}
                  </a>
                ))}
              </div>
            ))}
            <a href="/mint" onClick={() => setOpen(false)} className="mt-3 block border border-signal/50 bg-signal/10 py-4 text-center font-mono text-base uppercase tracking-[0.25em] text-signal sm:hidden">
              Mint&nbsp;Shards
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
