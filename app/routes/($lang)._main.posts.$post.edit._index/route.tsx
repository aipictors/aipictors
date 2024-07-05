import { ParamsError } from "@/_errors/params-error"
import { EditImageForm } from "@/routes/($lang)._main.posts.$post.edit._index/_components/edit-image-form"
import { useParams } from "@remix-run/react"
import { Suspense } from "react"

export default function EditImage() {
  const params = useParams()

  console.log(params)

  if (params.work === undefined) {
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
        <EditImageForm workId={params.work} />
      </Suspense>
    </div>
  )
}
