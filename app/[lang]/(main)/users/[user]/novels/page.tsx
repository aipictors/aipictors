import { UserNovelList } from "@/app/[lang]/(main)/users/[user]/novels/_components/user-novel-list"
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
