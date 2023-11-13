import NewImageForm from "@/app/[lang]/(main)/new/image/_components/new-image-form"
import type { Metadata } from "next"

const NewImagePage = () => {
  return <NewImageForm />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NewImagePage
