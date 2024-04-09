import { RedirectType, redirect } from "next/navigation"

/**
 * https://www.aipictors.com/idea/
 */
export default function RedirectsIdea() {
  redirect("/themes", RedirectType.replace)
}
