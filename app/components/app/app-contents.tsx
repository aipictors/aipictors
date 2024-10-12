import { cn } from "~/lib/utils"

type Props = Readonly<{
  outlet: React.ReactNode
  aside?: React.ReactNode
  isOpen: boolean
}>

/**
 * コンテンツ
 */
export function AppContents(props: Props) {
  return (
    <>
      <div className="flex">
        {props.aside && props.aside}
        <div
          className={cn("m-auto w-full space-y-4 overflow-auto pb-4", {
            "px-4 md:pr-8 md:pl-52": props.isOpen,
            "px-4 md:px-8": !props.isOpen,
          })}
        >
          {props.outlet}
        </div>
      </div>
    </>
  )
}
