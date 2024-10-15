import { ParamsError } from "~/errors/params-error"
import { NoteArticle } from "~/routes/($lang)._main.notes.$note/components/note-article"
import { useParams } from "@remix-run/react"

export default function Note() {
  const params = useParams()

  if (params.note === undefined) {
    throw new ParamsError()
  }

  return (
    <>
      <NoteArticle />
    </>
  )
}
