import { RedirectType, redirect } from "next/navigation"

/**
 * https://www.aipictors.com/idea/
 */
export default function StampSpace() {
  redirect("/stickers", RedirectType.replace)
}
