import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { NoteArticle } from "@/routes/($lang)._main.notes.$note/_components/note-article"
import { useParams } from "@remix-run/react"

export default function Note() {
  const params = useParams()

  if (params.note === undefined) {
    throw new ParamsError()
  }

  return (
    <AppPage>
      <NoteArticle />
    </AppPage>
  )
}
