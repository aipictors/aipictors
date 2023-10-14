import { LogoList } from "app/[lang]/(main)/logo/components/LogoList"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

const LogoPage = async () => {
  return (
    <MainPage>
      <LogoList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default LogoPage
