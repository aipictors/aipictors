import { UserNovelList } from "@/[lang]/(main)/users/[user]/novels/_components/user-novel-list"
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

export default UserNovelsPage
