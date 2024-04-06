import { NoteCard } from "@/[lang]/(main)/notes/_components/note-card"

import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * コラムの一覧
 * @returns
 */
const NotesPage = async () => {
  return (
    <AppPage>
      <div>
        <NoteCard />
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NotesPage
