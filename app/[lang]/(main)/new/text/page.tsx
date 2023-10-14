import { NewTextForm } from "app/[lang]/(main)/new/text/components/NewTextForm"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

const NewTextPage = async () => {
  return (
    <MainPage>
      <NewTextForm />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NewTextPage
