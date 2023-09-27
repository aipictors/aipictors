import type { Metadata } from "next"
import { TagList } from "app/(main)/tags/components/TagList"
import { MainPage } from "app/components/MainPage"

const HomePage = async () => {
  return (
    <MainPage>
      <TagList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
