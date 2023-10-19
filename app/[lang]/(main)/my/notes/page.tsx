import type { Metadata } from "next"

const MyNotesPage = async () => {
  return null
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyNotesPage
