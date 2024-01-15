import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * サイトについて
 * @returns
 */
const AboutPage = async () => {
  return (
    <AppPage>
      <div className="flex flex-col">
        <p>{"このサイトについて"}</p>
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutPage
