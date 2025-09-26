import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { Link } from "@remix-run/react"

/**
 * リンク
 */
export function GenerationLinksView() {
  const context = useGenerationContext()

  const isNonSubscription = !context.currentPass

  return (
    <GenerationViewCard>
      <div className="min-h-96">
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
