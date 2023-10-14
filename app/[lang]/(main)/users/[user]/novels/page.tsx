import { UserNovelList } from "app/[lang]/(main)/users/[user]/novels/components/UserNovelList"
import type { Metadata } from "next"

const UserNovelsPage = async () => {
  return (
    <>
      <UserNovelList />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserNovelsPage
