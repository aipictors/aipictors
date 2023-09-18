import type { Metadata } from "next"
import NewImageForm from "app/(main)/new/image/components/NewImageForm"

const NewImagePage = () => {
  return <NewImageForm></NewImageForm>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NewImagePage
