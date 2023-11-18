import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * 特定商取引法に基づく表記
 * @returns
 */
const SctaPage = async () => {
  return (
    <MainPage>
      <article>
        <h1>{"特定商取引法に基づく表記"}</h1>
      </article>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SctaPage
