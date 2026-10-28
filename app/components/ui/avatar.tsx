import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
    /** 縮小版の幅（px）。48px より大きく表示するアイコンは大きくする */
    resizeWidth?: number
  }
>(({ className, alt = "", src, resizeWidth = 96, ...props }, ref) => (
  // alt 未指定のアイコンは名前と並べて表示されるので装飾画像として扱う
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    alt={alt}
    // アイコンは小さく表示するので縮小版にする（元画像は 240px 前後・最大 70KB ほど）。
    // Radix は src を先に読み込んで確かめるので srcset ではなく src を差し替える
    src={toResizedImageUrl(src, resizeWidth)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
