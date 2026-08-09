"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#universe", label: "Universe" },
  { href: "#prologue", label: "Prologue" },
  { href: "#actors", label: "Actors" },
  { href: "#token", label: "Token" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

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
          ? "border-b border-hairline bg-abyss/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="display text-lg tracking-[0.35em] text-ink">
          AI&nbsp;WARS
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-dim transition-colors hover:text-signal"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#mint"
          className="border border-signal/50 bg-signal/10 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-signal transition-all hover:border-signal hover:bg-signal/20"
        >
          Mint&nbsp;$AIWARS
        </a>
      </nav>
    </header>
  );
}
