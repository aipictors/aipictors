import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const Images25dPage = async () => {
  return <PagePlaceholder>{"セミリアル"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default Images25dPage
