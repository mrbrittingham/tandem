import React from "react";
import { getWidgetIconPaths, WidgetIconName } from "../../lib/icon-loader";

interface WidgetIconProps {
  name: WidgetIconName;
  alt?: string;
  className?: string;
}

export function WidgetIcon({ name, alt = "Chat Widget Icon", className }: WidgetIconProps) {
  const { webp, png } = getWidgetIconPaths(name);

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={png}
        alt={alt}
        className={className}
        loading="lazy"
        width={64}
        height={64}
      />
    </picture>
  );
}
