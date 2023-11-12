import { NoteList } from "app/[lang]/(main)/notes/_components/note-list"
import { MainPage } from "app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * コラムの一覧
 * @returns
 */
const NotesPage = async () => {
  return (
    <MainPage>
      <NoteList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NotesPage
