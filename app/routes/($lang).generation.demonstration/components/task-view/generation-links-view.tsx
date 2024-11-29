import { GenerationViewCard } from "~/routes/($lang).generation.demonstration/components/generation-view-card"
import { useGenerationContext } from "~/routes/($lang).generation.demonstration/hooks/use-generation-context"
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
              src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/nonsubscription-banner.jpg"
              alt="google form non subscription"
              className="mb-4 max-h-32 w-auto rounded-md"
            />
          </Link>
        ) : (
          <Link to="https://forms.gle/3bPTebm44vyF3HjD6">
            <img
              src="https://www.aipictors.com/wp-content/uploads/2023/11/gene-anke-banner-2.webp"
              alt="google form"
              className="mb-4 max-h-32 w-auto rounded-md"
            />
          </Link>
        )}
        <Link
          to="https://discord.com/invite/aipictors"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://www.aipictors.com/wp-content/themes/AISite/images/banner/discord-generation-banner-3.webp"
            alt="discord"
            className="mb-4 max-h-32 w-auto rounded-md"
          />
        </Link>
      </div>
    </GenerationViewCard>
  )
}
