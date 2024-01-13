import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * 組織について
 * @returns
 */
const AboutUsPage = async () => {
  return (
    <AppPage>
      <div className="flex flex-col">
        <p>{"運営会社について"}</p>
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutUsPage
