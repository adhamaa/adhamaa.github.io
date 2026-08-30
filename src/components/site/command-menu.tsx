"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Clipboard,
  Download,
  Home,
  Laptop,
  Moon,
  Sun,
  Terminal,
  User,
} from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { profile, socials } from "@/data/profile";

export const OPEN_COMMAND_MENU = "open-command-menu";

/** Opens the ⌘K palette from anywhere (used by the nav button). */
export function openCommandMenu() {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_MENU));
}

const jumpLinks = [
  { label: "Selected work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Stack", href: "/#stack" },
  { label: "How I work", href: "/#approach" },
  { label: "Contact", href: "/#contact" },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_MENU, onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_MENU, onOpen);
    };
  }, []);

  const run = React.useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        {/*
          React Aria's menu owns the empty state rather than accepting a sibling
          the way cmdk did, so the "no results" copy is handed to it as a render
          prop instead of sitting in the list.
        */}
        <CommandList renderEmptyState={() => <CommandEmpty>No results.</CommandEmpty>}>
          <CommandGroup heading="Navigate">
            <CommandItem textValue="Home" onAction={() => run(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem textValue="About" onAction={() => run(() => router.push("/about"))}>
              <User className="mr-2 h-4 w-4" />
              About
            </CommandItem>
            <CommandItem textValue="Lab" onAction={() => run(() => router.push("/table"))}>
              <Terminal className="mr-2 h-4 w-4" />
              Lab
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Jump to">
            {jumpLinks.map((item) => (
              <CommandItem
                key={item.href}
                textValue={item.label}
                onAction={() => run(() => router.push(item.href))}
              >
                <span className="mr-2 font-mono text-xs text-brand">#</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Connect">
            {socials.map((social) => (
              <CommandItem
                key={social.name}
                textValue={`${social.name} ${social.handle}`}
                onAction={() =>
                  run(() => window.open(social.href, "_blank", "noopener,noreferrer"))
                }
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {social.name}
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {social.handle}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              textValue="Download résumé"
              onAction={() =>
                run(() =>
                  window.open(profile.resumeUrl, "_blank", "noopener,noreferrer")
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download résumé
            </CommandItem>
            <CommandItem
              textValue="Copy email"
              onAction={() =>
                run(() => {
                  navigator.clipboard
                    ?.writeText(profile.email)
                    .then(() => toast.success("Email copied to clipboard"))
                    .catch(() => toast.error("Couldn't copy — long-press instead"));
                })
              }
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Copy email
              <CommandShortcut>{profile.email}</CommandShortcut>
            </CommandItem>
            <CommandItem textValue="Light theme" onAction={() => run(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              Light theme
            </CommandItem>
            <CommandItem textValue="Dark theme" onAction={() => run(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark theme
            </CommandItem>
            <CommandItem textValue="System theme" onAction={() => run(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              System theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
