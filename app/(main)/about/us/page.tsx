import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const AboutUsPage = async () => {
  return <PagePlaceholder>{"運営会社について"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutUsPage
