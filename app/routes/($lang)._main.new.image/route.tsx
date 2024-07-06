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
        title="このページは現在開発中です。不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/post"
        date="2024-07-30"
      />
      <NewImageForm />
    </div>
  )
}
