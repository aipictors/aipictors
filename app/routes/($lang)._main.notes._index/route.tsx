import { NoteCard } from "@/[lang]/(main)/notes/_components/note-card"
import { AppPage } from "@/_components/app/app-page"

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
