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
import { profile, sectionLinks, socials } from "@/data/profile";

export const OPEN_COMMAND_MENU = "open-command-menu";

/** Opens the ⌘K palette from anywhere (used by the nav button). */
export function openCommandMenu() {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_MENU));
}

/*
 * React Aria derives an item's filter text from its children only when they are
 * a plain string. Every item here is an icon plus a label, so each list below
 * keeps the label as the single source for both the text and the filter value.
 */
const routes = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: User },
  { label: "Lab", href: "/table", icon: Terminal },
];

const themes = [
  { label: "Light theme", value: "light", icon: Sun },
  { label: "Dark theme", value: "dark", icon: Moon },
  { label: "System theme", value: "system", icon: Laptop },
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
            {routes.map(({ label, href, icon: Icon }) => (
              <CommandItem
                key={href}
                textValue={label}
                onAction={() => run(() => router.push(href))}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Jump to">
            {sectionLinks.map((item) => (
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
            {themes.map(({ label, value, icon: Icon }) => (
              <CommandItem
                key={value}
                textValue={label}
                onAction={() => run(() => setTheme(value))}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
