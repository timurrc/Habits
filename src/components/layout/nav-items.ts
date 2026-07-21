import type { LucideIcon } from "lucide-react";
import { ListChecks, Settings, Target, TrendingUp } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Сегодня", icon: Target },
  { href: "/habits", label: "Привычки", icon: ListChecks },
  { href: "/stats", label: "Статистика", icon: TrendingUp },
  { href: "/settings", label: "Настройки", icon: Settings },
];
