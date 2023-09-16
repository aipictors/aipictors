import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const Images2dPage = async () => {
  return <PagePlaceholder>{"イラスト"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default Images2dPage
