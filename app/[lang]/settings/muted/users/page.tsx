import { MutedUserList } from "app/[lang]/settings/muted/users/_components/MutedUserList"
import { MainCenterPage } from "app/_components/pages/MainCenterPage"
import type { Metadata } from "next"

const SettingMutedUsersPage = async () => {
  return (
    <MainCenterPage>
      <MutedUserList />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingMutedUsersPage
