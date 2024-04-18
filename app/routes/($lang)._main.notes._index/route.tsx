import { AppPage } from "@/_components/app/app-page"
import { NoteCard } from "@/routes/($lang)._main.notes._index/_components/note-card"

/**
 * コラムの一覧
 * @returns
 */
export default function Notes() {
  return (
    <AppPage>
      <div>
        <NoteCard />
      </div>
    </AppPage>
  )
}
