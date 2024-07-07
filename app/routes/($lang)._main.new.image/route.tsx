import { ConstructionAlert } from "@/_components/construction-alert"
import { NewImageForm } from "@/routes/($lang)._main.new.image/_components/new-image-form"

export default function NewImage() {
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
        fallbackURL="https://www.aipictors.com/post"
      />
      <NewImageForm />
    </div>
  )
}
