export type WidgetIconName =
  | "Warm-Glow"
  | "Violet-Drift"
  | "Soft-Earth"
  | "Red-Pop"
  | "Orange-Shift"
  | "Coral-Splash"
  | "Blue-Breeze"
  | "Aqua-Blend"
  | "Amber-Rise";

export function getWidgetIconPaths(name: WidgetIconName) {
  return {
    webp: `/widget-icons/webp/${name}.webp`,
    png: `/widget-icons/png/${name}.png`,
  };
}
