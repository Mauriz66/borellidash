import type * as React from "react";

export type ThemeMap = { light: string; dark: string };

export type ChartItemConfig = {
  label?: React.ReactNode;
  icon?: React.ComponentType;
} & ({ color?: string; theme?: never } | { color?: never; theme: ThemeMap });

export type ChartConfig = Record<string, ChartItemConfig>;