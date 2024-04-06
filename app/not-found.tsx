import { AppNotFoundPage } from "@/_components/app/app-not-found-page"

/**
 * next/navigationのnotFoundと名前が被るので、関数名をRootNotFoundにした。
 */
export default function RootNotFound() {
  return <AppNotFoundPage />
}
