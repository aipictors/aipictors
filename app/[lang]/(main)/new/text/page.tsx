import { NewTextForm } from "@/[lang]/(main)/new/text/_components/new-text-form"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

const NewTextPage = async () => {
  return (
    <AppPage>
      <NewTextForm />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NewTextPage
