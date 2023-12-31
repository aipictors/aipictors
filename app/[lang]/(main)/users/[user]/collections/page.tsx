import { UserCollectionList } from "@/app/[lang]/(main)/users/[user]/collections/_components/user-collection-list"
import type { Metadata } from "next"

const UserCollectionsPage = async () => {
  return (
    <>
      <UserCollectionList />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserCollectionsPage
