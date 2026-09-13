"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const links = [
  { href: "/#universe", label: "Universe" },
  { href: "/#prologue", label: "Prologue" },
  { href: "/nft", label: "Mint" },
  { href: "/whitepaper", label: "Whitepaper" },
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
          ? "border-b border-hairline bg-abyss/85 backdrop-blur-md"
          : "border-b border-transparent bg-abyss/50 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="/" aria-label="AI Wars home" className="text-ink transition-colors hover:text-signal">
          <Logo className="text-2xl" />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative font-mono text-base uppercase tracking-[0.25em] text-dim transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-300 hover:text-signal hover:after:scale-x-100"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="/nft"
          className="border border-signal/50 bg-signal/10 px-4 py-2 font-mono text-base uppercase tracking-[0.25em] text-signal transition-all hover:border-signal hover:bg-signal/20"
        >
          Mint&nbsp;Shards
        </a>
      </nav>
    </header>
  );
}
