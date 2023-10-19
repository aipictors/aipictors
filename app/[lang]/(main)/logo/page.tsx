import { LogoList } from "app/[lang]/(main)/logo/_components/LogoList"
import { MainPage } from "app/_components/MainPage"
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
