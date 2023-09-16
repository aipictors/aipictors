import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const ThemePage = async () => {
  return <PagePlaceholder>{"テーマ"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemePage
