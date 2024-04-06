import { cn } from "@/_lib/utils"

type Props = {
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
        "container fixed z-50 h-auto w-full bg-card py-4 shadow-md",
        "md:static md:bg-none md:p-0 md:shadow-none",
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
