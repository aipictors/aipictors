import { AppAboutHeader } from "@/[lang]/app/_components/app-about-header"
import { AppFooter } from "@/[lang]/app/_components/app-footer"

export default function FlutterApp() {
  return (
    <>
      <AppAboutHeader />
      {/* <Suspense fallback={null}>
        <AppMilestoneList />
      </Suspense> */}
      <AppFooter />
    </>
  )
}
