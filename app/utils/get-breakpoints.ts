export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl"

export function getBreakpoint(width: number): Breakpoint {
  if (width < 640) {
    return "base" as const
  }

  if (width < 768) {
    return "sm" as const
  }

  if (width < 1024) {
    return "md" as const
  }

  if (width < 1280) {
    return "lg" as const
  }

  return "xl" as const
}
