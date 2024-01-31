import { AppNotFound } from "@/components/app/app-not-found"

/**
 * next/navigationのnotFoundと名前が被るので、関数名をRootNotFoundにした。
 */
export default function RootNotFound() {
  return <AppNotFound />
}
