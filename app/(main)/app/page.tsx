import type { Metadata } from "next"
import { AppDocument } from "app/(main)/app/components/AppDocument"
import { MainPage } from "app/components/MainPage"

const AppPage = async () => {
  return (
    <MainPage>
      <AppDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AppPage
