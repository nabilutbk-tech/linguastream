"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Upload, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const navItems = [
  { href: "/", label: "Library", icon: Library },
  { href: "/local", label: "Local", icon: Upload },
  { href: "/vocabulary", label: "Vocab", icon: BookOpen },
  { href: "/quiz", label: "Quiz", icon: Sparkles },
];

function MobileNavContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border/40">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavContent />
    </Suspense>
  );
}