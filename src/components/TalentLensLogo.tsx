"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export interface TalentLensLogoProps {
  className?: string;
  badge?: string;
  subtitle?: string;
  asLink?: boolean;
  href?: string;
  size?: "default" | "sm" | "lg";
}

export const TalentLensLogo: React.FC<TalentLensLogoProps> = ({
  className = "",
  badge = "PRECISION V2.0",
  subtitle,
  asLink = true,
  href = "/",
  size = "default",
}) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const boxSize = isSm ? "w-7 h-7" : isLg ? "w-9 h-9" : "w-8 h-8";
  const iconSize = isSm ? "w-3.5 h-3.5" : isLg ? "w-4.5 h-4.5" : "w-4 h-4";
  const textSize = isSm ? "text-sm" : isLg ? "text-lg" : "text-base";

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* Official Homepage Navbar Logo Icon in Light and Dark Modes */}
      <div
        className={`${boxSize} rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-wider shadow-sm transition-transform group-hover:scale-105 shrink-0`}
      >
        <Zap className={`${iconSize} fill-current text-emerald-500`} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-semibold ${textSize} tracking-tight font-mono text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors`}
          >
            TALENTLENS
          </span>
          {badge && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block font-sans">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};

