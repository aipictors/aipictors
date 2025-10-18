import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * リンク
 */
export function GenerationLinksView() {
  const context = useGenerationContext()
  const t = useTranslation()

  const isNonSubscription = !context.currentPass

  return (
    <GenerationViewCard>
      <div className="min-h-96">
        {/* キャラクター表情生成へのリンク */}
        <Link to="/characters">
          <div className="mb-4 rounded-md border-2 border-primary/30 border-dashed bg-gradient-to-r from-primary/5 to-secondary/5 p-4 transition-colors hover:border-primary/50 hover:from-primary/10 hover:to-secondary/10">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/20 p-2">
                <span className="text-2xl">😊</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary">
                  {t("キャラクター表情生成", "Character Expression Generation")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    "オリジナルキャラクターの様々な表情を生成してみよう！",
                    "Generate various expressions for your original characters!",
                  )}
                </p>
              </div>
              <div className="text-primary">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {isNonSubscription ? (
          <Link to="https://forms.gle/Md4kZmTsZHA2TqYz6">
            <img
              src="https://assets.aipictors.com/aipictors-link-banner-generation.webp"
              alt="google form non subscription"
              className="mb-4 max-h-32 w-auto rounded-md"
            />
          </Link>
        ) : (
          <Link to="https://forms.gle/3bPTebm44vyF3HjD6">
            <img
              src="https://assets.aipictors.com/aipictors-link-banner-generation.webp"
              alt="google form"
              className="mb-4 max-h-32 w-auto rounded-md"
            />
          </Link>
        )}
        <Link
          to="https://discord.gg/7jA2MmtvtR"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://assets.aipictors.com/aipictors-link-banner-discord.webp"
            alt="discord"
            className="mb-4 max-h-32 w-auto rounded-md"
          />
        </Link>
      </div>
    </GenerationViewCard>
  )
}
