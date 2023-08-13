import { Metadata } from "next"

const HomePage = async () => {
  return null
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
