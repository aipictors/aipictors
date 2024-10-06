import { ParamsError } from "~/errors/params-error"
import { NoteArticle } from "~/routes/($lang)._main.notes.$note/components/note-article"
import { useParams } from "react-router"

export default function Note() {
  const params = useParams()

  if (params.note === undefined) {
    throw ParamsError()
  }

  return (
    <>
      <NoteArticle />
    </>
  )
}
