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
          // className={`container m-auto space-y-4 overflow-auto pb-4 ${props.isOpen ? "px-4 md:pr-8 md:pl-52" : "px-0 md:px-8"}`}
          className={`m-auto w-full space-y-4 overflow-auto pb-4 ${props.isOpen ? "px-4 md:pr-8 md:pl-52" : "px-0 md:px-8"}`}
        >
          {props.outlet}
        </div>
      </div>
    </>
  )
}
