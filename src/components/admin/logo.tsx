import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo Nathafty (cadre circulaire blanc — même traitement que la PWA cliente). */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full border bg-white", className)}
      style={{ width: size, height: size }}
    >
      <Image src="/assets/nathafty.jpeg" alt="Nathafty" fill sizes={`${size}px`} className="object-contain p-0.5" />
    </div>
  );
}
