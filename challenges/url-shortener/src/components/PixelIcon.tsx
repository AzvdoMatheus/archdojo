interface PixelIconProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PixelIcon({ name, size = "md", className = "" }: PixelIconProps) {
  return <i className={`pixelart-icons-font-${name} icon-${size} ${className}`} />;
}
