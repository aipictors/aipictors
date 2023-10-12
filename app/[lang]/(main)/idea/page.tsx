import { RedirectType } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"

/**
 * https://www.aipictors.com/idea/
 */
const Page = async () => {
  redirect("/themes", RedirectType.replace)
}

export default Page
