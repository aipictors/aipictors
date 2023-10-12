import { RedirectType } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"

/**
 * https://www.aipictors.com/series/
 */
const Page = async () => {
  redirect("/albums", RedirectType.replace)
}

export default Page
