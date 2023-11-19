import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

/**
 * 中央寄せのページ
 * @param props
 * @returns
 */
export const MainCenterPage = (props: Props) => {
  return (
    <div
      className="w-full flex justify-center"
      style={{ minHeight: "calc(100svh - 72px)" }}
    >
      <div className={cn("w-full max-w-screen-md", props.className)}>
        {props.children}
      </div>
    </div>
  )
}
