import type { Metadata } from "next"
import { RelatedTagList } from "app/(main)/tags/[tag]/components/RelatedTagList"
import { WorkList } from "app/(main)/works/components/WorkList"
import { MainPage } from "app/components/MainPage"

const TagPage = async () => {
  return (
    <MainPage>
      <WorkList />
      <RelatedTagList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TagPage
