import { NoteArticle } from "@/app/[lang]/(main)/notes/[note]/_components/note-article"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * コラムの詳細
 * @returns
 */
const NotePage = async () => {
  return (
    <AppPage>
      <NoteArticle />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default NotePage
