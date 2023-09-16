import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const Images3dPage = async () => {
  return <PagePlaceholder>{"フォト"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default Images3dPage
