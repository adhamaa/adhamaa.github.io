"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { navLinks, profile } from "@/data/profile";
import { openCommandMenu } from "@/components/site/command-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border/80 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm tracking-tight"
        >
          <span className="text-brand">~/</span>
          <span className="font-medium">{profile.handle}</span>
          <span className="h-4 w-[7px] bg-brand animate-blink group-hover:opacity-100" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn(active ? "text-brand" : "text-brand/40")}>
                  {"//"}{" "}
                </span>
                {link.label.toLowerCase()}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandMenu}
            aria-label="Open command menu"
            className="inline-flex h-8 items-center gap-2 rounded-md border border-border/80 px-2.5 text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden font-mono text-xs md:inline">Search</span>
            <kbd className="hidden rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] leading-4 md:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav row */}
      <nav
        aria-label="Primary mobile"
        className="container flex items-center gap-1 border-t border-border/60 py-1.5 sm:hidden"
      >
        {navLinks.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded px-2 py-1 font-mono text-xs transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label.toLowerCase()}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
