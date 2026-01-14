import { cn } from "~/lib/utils"

type Props = Readonly<{
  position: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
}>

/**
 * 画面に固定表示するコンテンツ
 */
export function AppFixedContent(props: Props) {
  return (
    <div
      className={cn(
        "container fixed z-50 h-auto w-full bg-card py-4 shadow-md",
        "supports-[backdrop-filter]:bg-card/80 supports-[backdrop-filter]:backdrop-blur",
        "md:static md:bg-none md:p-0 md:shadow-none",
        {
          "top-0 left-0 pt-[env(safe-area-inset-top)]":
            props.position === "top" || props.position === "left",
          "bottom-0 left-0 border-border/60 border-t pb-[env(safe-area-inset-bottom)]":
            props.position === "bottom",
          "top-0 right-0 pt-[env(safe-area-inset-top)]":
            props.position === "right",
        },
      )}
    >
      {props.children}
    </div>
  )
}
