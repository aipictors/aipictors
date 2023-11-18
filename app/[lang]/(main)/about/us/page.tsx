import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * 組織について
 * @returns
 */
const AboutUsPage = async () => {
  return (
    <MainPage>
      <div className="flex flex-col">
        <p>{"運営会社について"}</p>
      </div>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutUsPage
