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
          className={`container m-auto max-w-[100%] space-y-4 overflow-auto ${props.isOpen ? "px-4 md:pr-8 md:pl-52" : "px-4 md:px-8"}`}
        >
          {props.outlet}
        </div>
      </div>
    </>
  )
}
