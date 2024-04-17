import { NoteArticle } from "@/[lang]/(main)/notes/[note]/_components/note-article"
import { AppPage } from "@/_components/app/app-page"
import { useParams } from "@remix-run/react"

export default function Note() {
  const params = useParams()

  if (params.note === undefined) {
    throw new Error()
  }

  return (
    <AppPage>
      <NoteArticle />
    </AppPage>
  )
}
