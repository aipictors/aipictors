import { NoteList } from "app/[lang]/(main)/notes/_components/NoteList"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

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
