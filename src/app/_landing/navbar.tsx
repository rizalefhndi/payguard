"use client"

import Link from "next/link"
import { ShieldCheck, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[var(--shadow-teal-glow)]">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">PayGuard</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#fitur" className="hover:text-foreground transition-colors">Fitur</a>
          <a href="#cara-kerja" className="hover:text-foreground transition-colors">Cara Kerja</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Statistik</a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Daftar Gratis
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <a href="#fitur" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Fitur</a>
          <a href="#cara-kerja" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Cara Kerja</a>
          <a href="#stats" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Statistik</a>
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">Masuk</Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button size="sm" className="w-full">Daftar</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
