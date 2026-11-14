// Keep the real Recharts Tooltip as a chart child: Recharts discovers it by
// component type. Its default inline white surface does not follow dark mode.
export const chartTooltipTheme = {
  contentStyle: {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: 8,
  },
  labelStyle: { color: "var(--popover-foreground)" },
  itemStyle: { color: "var(--popover-foreground)" },
};
