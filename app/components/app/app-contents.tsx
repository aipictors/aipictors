type Props = Readonly<{
  outlet: React.ReactNode
  aside?: React.ReactNode
  header?: React.ReactNode
}>

/**
 * コンテンツ
 */
export function AppContents(props: Props) {
  return (
    <>
      <div className="flex px-2">
        <div className="hidden md:block">{props.aside && props.aside}</div>
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-linear-gradient-top-to-bottom dark:opacity-20" />
        <div className="absolute top-0">{props.header && props.header}</div>
        <div className="w-full pt-24">
          <div
            className={
              "w-full space-y-4 pb-4 sm:ml-[0px] md:ml-[72px] md:max-w-[calc(100vw_-_96px)] lg:ml-[218px] lg:max-w-[calc(100vw_-_248px)]"
            }
          >
            {props.outlet}
          </div>
        </div>
      </div>
    </>
  )
}
