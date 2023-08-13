import { Metadata } from "next"
import { RedirectType } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"
import { Config } from "config"

const HomePage = async () => {
  redirect(Config.currentWebSiteURL, RedirectType.replace)
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
