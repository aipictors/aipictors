import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const AboutPage = async () => {
  return <PagePlaceholder>{"/privacy"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutPage
