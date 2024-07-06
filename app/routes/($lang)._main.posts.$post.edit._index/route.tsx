import { ParamsError } from "@/_errors/params-error"
import { EditImageForm } from "@/routes/($lang)._main.posts.$post.edit._index/_components/edit-image-form"
import { useParams } from "@remix-run/react"
import { Suspense } from "react"

export default function EditImage() {
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  return (
    <div
      className="container"
      style={{
        margin: "0 auto",
      }}
    >
      <Suspense>
        <EditImageForm workId={params.post} />
      </Suspense>
    </div>
  )
}
