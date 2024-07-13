import { ConstructionAlert } from "@/_components/construction-alert"
import { ParamsError } from "@/_errors/params-error"
import { useParams } from "@remix-run/react"

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
        title="試験的にリニューアル版を運用中です。"
        fallbackURL={`https://www.aipictors.com/edit-work/?id=${params.post}`}
      />

      {/* <Suspense>
        <EditImageForm workId={params.post} />
      </Suspense> */}
    </div>
  )
}
