import { Metadata } from "next"

const NewTextPage = async () => {
  return {"投稿"}
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NewTextPage
