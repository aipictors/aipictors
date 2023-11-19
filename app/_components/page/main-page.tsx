import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

/**
 * 普通のページ
 * @param props
 * @returns
 */
export const MainPage = (props: Props) => {
  return (
    <main
      className={cn(
        "overflow-x-hidden w-full flex flex-col pb-4",
        props.className,
      )}
    >
      {props.children}
    </main>
  )
}
