import { NoteArticle } from "app/[lang]/(main)/notes/[note]/_components/NoteArticle"
import { MainPage } from "app/_components/page/MainPage"
import type { Metadata } from "next"

/**
 * コラムの詳細
 * @returns
 */
const NotePage = async () => {
  return (
    <MainPage>
      <NoteArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NotePage
