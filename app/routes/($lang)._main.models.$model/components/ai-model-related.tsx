import { HashIcon } from "lucide-react"
import { Link } from "~/lib/app/locale-router"
import { useTranslation } from "~/hooks/use-translation"

export type AiModelRelatedModel = {
  id: string
  /** /models/<名前> の名前 */
  modelName: string
  displayName: string
  type: string
  thumbnailImageURL: string | null
}

type Props = {
  name: string
  tags: { name: string; count: number }[]
  models: AiModelRelatedModel[]
  isSensitive: boolean
}

/**
 * このモデルの作品によく付いているタグと、似たモデル（作品一覧の下に出して、次に見るものを案内する）
 */
export function AiModelRelated(props: Props) {
  const t = useTranslation()

  const prefix = props.isSensitive ? "/r" : ""

  if (props.tags.length === 0 && props.models.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 border-t pt-6">
      {props.tags.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-base md:text-lg">
            {t(
              `${props.name}の作品によく付いているタグ`,
              `Popular tags in ${props.name} works`,
            )}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {props.tags.map((tag) => (
              <li key={tag.name}>
                <Link
                  to={`${prefix}/tags/${encodeURIComponent(tag.name)}`}
                  className="inline-flex items-center gap-0.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted"
                >
                  <HashIcon className="size-3.5 text-muted-foreground" />
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {props.models.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-base md:text-lg">
            {t("似ているモデル", "Similar models")}
          </h2>
          <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
            {props.models.map((model) => (
              <li key={model.id} className="w-28 shrink-0 snap-start md:w-32">
                <Link
                  to={`${prefix}/models/${encodeURIComponent(model.modelName)}`}
                  className="group flex flex-col gap-1"
                >
                  <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
                    {model.thumbnailImageURL && (
                      <img
                        src={model.thumbnailImageURL}
                        alt={t(
                          `${model.displayName}で生成した作品の例`,
                          `Example made with ${model.displayName}`,
                        )}
                        loading="lazy"
                        decoding="async"
                        width={128}
                        height={128}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <span className="truncate font-medium text-sm">
                    {model.displayName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {model.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
