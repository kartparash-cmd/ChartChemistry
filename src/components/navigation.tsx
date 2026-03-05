"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Sparkles,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  LogIn,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/learn", label: "Learn" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const authedNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/horoscope", label: "Horoscope" },
  { href: "/transits", label: "Transits" },
  { href: "/wellness", label: "Wellness" },
  { href: "/connections", label: "Connections" },
  { href: "/chat", label: "AI Chat" },
  { href: "/learn", label: "Learn" },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown and mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isAuthPage = pathname?.startsWith("/auth");
  if (isAuthPage) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="h-5 w-5 text-cosmic-purple-light transition-transform group-hover:rotate-12" />
          <span className="font-heading text-xl font-bold cosmic-text">
            ChartChemistry
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {(session ? authedNavLinks : publicNavLinks).map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-cosmic-purple-light"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-muted"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth / User Section */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-muted"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full ring-2 ring-cosmic-purple/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cosmic-purple/20 ring-2 ring-cosmic-purple/30">
                    <User className="h-4 w-4 text-cosmic-purple-light" />
                  </div>
                )}
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-popover/95 backdrop-blur-xl p-1 shadow-xl"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-medium truncate flex items-center">
                          {session.user.name}
                          {session.user.plan && session.user.plan !== "FREE" && (
                            <span className="ml-2 rounded-full bg-cosmic-purple/20 px-2 py-0.5 text-[10px] font-semibold text-cosmic-purple-light">
                              {session.user.plan}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard?tab=settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Support
                      </Link>
                      {session.user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-500 transition-colors hover:bg-muted"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button asChild size="sm" className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-popover/95 backdrop-blur-xl border-border"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cosmic-purple-light" />
                  <span className="cosmic-text font-heading">ChartChemistry</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-1">
                {(session ? authedNavLinks : publicNavLinks).map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-muted text-cosmic-purple-light"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="flex items-center gap-2 px-4 py-2">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">Toggle theme</span>
                </div>

                <div className="my-4 border-t border-border" />

                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="h-10 w-10 rounded-full ring-2 ring-cosmic-purple/30"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-purple/20">
                          <User className="h-5 w-5 text-cosmic-purple-light" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate flex items-center">
                          {session.user.name}
                          {session.user.plan && session.user.plan !== "FREE" && (
                            <span className="ml-2 shrink-0 rounded-full bg-cosmic-purple/20 px-2 py-0.5 text-[10px] font-semibold text-cosmic-purple-light">
                              {session.user.plan}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/support"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Support
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-amber-500 transition-colors hover:bg-muted"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-red-400 transition-colors hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-cosmic-purple-light transition-colors hover:bg-muted"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
