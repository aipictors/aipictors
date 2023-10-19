import { UnknownCanvas } from "app/[lang]/unknown/_components/unknownCanvas"
import type { Metadata } from "next"

const UnknownPage = async () => {
  return <UnknownCanvas />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UnknownPage
