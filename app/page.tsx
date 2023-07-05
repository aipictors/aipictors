import { Metadata } from "next"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Next.js",
}

const HomePage = async () => {
  return null
}

export default HomePage
