"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Heart,
  Home,
  PawPrint,
  Search,
  Settings,
  UserRound,
  Moon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Browse Pets", href: "/pets", icon: PawPrint },
  // { label: "Favorites", href: "/favorites", icon: Heart, badge: "12" },
  // { label: "Appointments", href: "/appointments", icon: CalendarDays },
  // { label: "Messages", href: "/messages", icon: Bell, badge: "67" },
  // { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Dark Mode", href: "/dark-mode", icon: Moon },
  // { label: "Test Page", href: "/testpage", icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const dark = storedTheme
      ? storedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleDarkMode = () => {
    const dark = !isDarkMode;
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <aside
      className={cn(
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        isOpen ? "w-72" : "w-20"
      )}
    >
      <div className="flex h-screen flex-col">
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
          <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <PawPrint className="h-4 w-4" />
            </div>

            {isOpen && (
              <div>
                <p className="text-sm font-semibold tracking-wide text-sidebar-foreground">
                  PawMatch
                </p>
                <p className="text-xs text-muted-foreground">
                  Adoption Hub
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                !isOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        <div className="px-3 py-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-muted-foreground",
              !isOpen && "justify-center px-2"
            )}
          >
            <Search className="h-4 w-4" />
            {isOpen && <span className="text-sm">
              Search
            </span>}
          </div>
        </div>
        {/* Sidebar Contents */}
        <ScrollArea className="flex-1 px-3 overflow-auto">
          <nav className="space-y-1.5">
            {navItems.map(({ label, href, icon: Icon, badge }) => {
              const active =
                href === "/"
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <a
                  key={label}
                  href={href}
                  onClick={
                    label === "Dark Mode"
                      ? (event) => {
                          event.preventDefault();
                          toggleDarkMode();
                        }
                      : undefined
                  }
                  aria-current={active ? "page" : undefined}
                  aria-pressed={label === "Dark Mode" ? isDarkMode : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    !isOpen ? "justify-center px-2" : "justify-start"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1">{label}</span>
                      {label === "Dark Mode" && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                            isDarkMode ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                              isDarkMode ? "translate-x-4" : "translate-x-0.5"
                            )}
                          />
                        </span>
                      )}
                      {badge && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-accent/40 p-3",
              !isOpen && "justify-center p-2"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-orange-300 text-sm font-semibold text-slate-950">
              JD
            </div>

            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  Jamie Doe
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Volunteer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
