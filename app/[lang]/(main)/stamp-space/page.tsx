import { RedirectType, redirect } from "next/navigation"

/**
 * https://www.aipictors.com/stamp-space/
 */
const Page = async () => {
  redirect("/stickers", RedirectType.replace)
}

export default Page
