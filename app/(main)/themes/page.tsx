import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const ThemesPage = async () => {
  return <PagePlaceholder>{"テーマの一覧"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemesPage
