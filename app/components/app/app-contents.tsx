import { useSidebar } from "~/contexts/sidebar-context"
import { AppAnnouncementBanner } from "~/components/app/app-announcement-banner"

type Props = Readonly<{
  outlet: React.ReactNode
  aside?: React.ReactNode
  header?: React.ReactNode
}>

/**
 * コンテンツ
 */
export function AppContents(props: Props) {
  const { sidebarState } = useSidebar()

  // サイドバーの状態に応じてマージンを調整
  const getContentMargin = () => {
    switch (sidebarState) {
      case "expanded":
        return "sm:ml-[0px] md:ml-[232px] md:max-w-[calc(100vw_-_276px)]"
      case "collapsed":
        return "sm:ml-[0px] md:ml-[80px] md:max-w-[calc(100vw_-_104px)]"
      case "minimal":
        return "sm:ml-[0px] md:ml-[0px] md:max-w-full"
      default:
        return "sm:ml-[0px] md:ml-[232px] md:max-w-[calc(100vw_-_276px)]"
    }
  }

  return (
    <>
      <div className="flex px-2">
        <div className="hidden md:block">{props.aside && props.aside}</div>
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-linear-gradient-top-to-bottom dark:opacity-20" />
        <div className="absolute top-0">{props.header && props.header}</div>
        <div className="w-full pt-24">
          <div className={`w-full ${getContentMargin()}`}>
            <AppAnnouncementBanner />
          </div>
          <div className={`w-full space-y-4 pb-4 ${getContentMargin()}`}>
            {props.outlet}
          </div>
        </div>
      </div>
    </>
  )
}
