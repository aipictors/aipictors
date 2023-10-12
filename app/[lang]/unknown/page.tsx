import type { Metadata } from "next"
import { UnknownCanvas } from "app/[lang]/unknown/components/unknownCanvas"

const UnknownPage = async () => {
  return <UnknownCanvas />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UnknownPage
