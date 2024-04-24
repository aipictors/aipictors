import {} from "@/_components/ui/tooltip"
import type { WorkTag } from "@/routes/($lang)._main._index/_types/work-tag"

type Props = {
  tags: WorkTag[]
}

export const HomeTagsSection = (props: Props) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        {props.tags.map((tag) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          <div className="h-24 w-16">
            <img alt="" src={tag.thumbnailUrl} />
          </div>
        ))}
      </div>
    </section>
  )
}
