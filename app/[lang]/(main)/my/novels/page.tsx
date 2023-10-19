import type { Metadata } from "next"

const MyNovelsPage = async () => {
  return null
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyNovelsPage
