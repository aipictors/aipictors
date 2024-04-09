import { AppPlaceholder } from "@/_components/app/app-placeholder"
import type { Metadata } from "next"

const SensitivePage = async () => {
  return <AppPlaceholder>{"センシティブ"}</AppPlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitivePage
