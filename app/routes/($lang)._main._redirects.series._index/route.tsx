import { RedirectType, redirect } from "next/navigation"

/**
 * https://www.aipictors.com/idea/
 */
export default function Series() {
  redirect("/albums", RedirectType.replace)
}
