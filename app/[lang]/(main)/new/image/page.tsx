import NewImageForm from "app/[lang]/(main)/new/image/components/NewImageForm"
import type { Metadata } from "next"

const NewImagePage = () => {
  return <NewImageForm />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NewImagePage
