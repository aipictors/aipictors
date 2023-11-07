import type { Metadata } from "next"

/**
 * メッセージの一覧
 * @returns
 */
const MessagesPage = async () => {
  return null
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagesPage
