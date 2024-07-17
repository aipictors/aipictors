import { ConstructionAlert } from "@/_components/construction-alert"
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
      className="container space-y-2"
      style={{
        margin: "0 auto",
      }}
    >
      <ConstructionAlert
        type="WARNING"
        message="試験的にリニューアル版を運用中です。"
        fallbackURL={`https://www.aipictors.com/edit-work/?id=${params.post}`}
      />

      <Suspense>
        <EditImageForm workId={params.post} />
      </Suspense>
    </div>
  )
}
