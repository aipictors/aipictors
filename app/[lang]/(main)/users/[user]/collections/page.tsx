import { UserCollectionList } from "app/[lang]/(main)/users/[user]/collections/components/UserCollectionList"
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
