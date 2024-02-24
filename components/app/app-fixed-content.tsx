import { cn } from "@/lib/utils"

type Props = {
  className?: string
  position: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
}

/**
 * 画面に固定表示するコンテンツ
 * @param props
 * @returns
 */
export const AppFixedContent = (props: Props) => {
  return (
    <div
      className={cn(
        "fixed container py-4 w-full h-auto bg-card shadow-md z-50",
        "md:static md:p-0 md:bg-none md:shadow-none",
        props.className,
        {
          "top-0 left-0": props.position === "top" || props.position === "left",
          "bottom-0 left-0": props.position === "bottom",
          "top-0 right-0": props.position === "right",
        },
      )}
    >
      {props.children}
    </div>
  )
}
