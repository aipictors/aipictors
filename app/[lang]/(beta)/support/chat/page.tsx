import { SupportChat } from "app/[lang]/(beta)/support/chat/_components/SupportChat"
import { MainCenterPage } from "app/_components/page/MainCenterPage"
import type { Metadata } from "next"

const MessagePage = async () => {
  return (
    <MainCenterPage>
      <SupportChat />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
