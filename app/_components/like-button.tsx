import React from "react"
import { Heart } from "lucide-react"
import { cn } from "@/_lib/utils"

type LikeButtonProps = {
  size?: number
  text?: string
  onClick?: (arg0: boolean) => void
  defaultLiked?: boolean
}

export const LikeButton = ({
  size = 40,
  defaultLiked = false,
  text,
  onClick,
}: LikeButtonProps) => {
  const width = Math.floor(size * 24)
  const [isLiked, setIsLiked] = React.useState(defaultLiked)
  const [clicked, setClicked] = React.useState(false)

  const handleOnClick = () => {
    if (onClick) onClick(!isLiked)
    setIsLiked(!isLiked)
    if (!clicked) setClicked(true)
  }

  return (
    <button
      className="relative flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
      style={{
        width: text ? "auto" : `${size}px`,
        height: `${size}px`,
        paddingLeft: text ? `${size}px` : "0",
      }}
      onClick={handleOnClick}
      type="button"
    >
      <div
        className={cn(
          "like-base-64 absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-full",
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundSize: `auto ${size}px`,
          transition: "background-position steps(25)",
          transitionDuration: isLiked ? "1s" : "0s",
          backgroundPosition: isLiked ? `-${width}px 0` : "0 0",
        }}
      >
        <Heart
          className={cn(
            isLiked
              ? "fill-pink-400 text-pink-400"
              : "fill-transparent text-black dark:text-white",
            clicked ? (isLiked ? "like-animation" : "like-animation-end") : "",
          )}
          size={Math.floor(size / 2)}
          strokeWidth={1}
        />
      </div>
      {text && (
        <span className={cn("mr-3 text-black text-sm dark:text-white")}>
          {text}
        </span>
      )}
    </button>
  )
}
