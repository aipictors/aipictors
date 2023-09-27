import type { Metadata } from "next"
import { NoteList } from "app/(main)/notes/components/NoteList"
import { NoteListItem } from "app/(main)/notes/components/NoteListItem"
import { MainPage } from "app/components/MainPage"

const NotesPage = async () => {
  return (
    <MainPage>
      <NoteList />
      <NoteListItem />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NotesPage
