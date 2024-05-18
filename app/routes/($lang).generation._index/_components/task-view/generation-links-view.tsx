import { GenerationViewCard } from "@/routes/($lang).generation._index/_components/generation-view-card"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import {} from "@apollo/client/index"

/**
 * リンク
 * @param props
 * @returns
 */
export const GenerationLinksView = () => {
  const context = useGenerationContext()

  const isNonSubscription = !context.currentPass

  return (
    <GenerationViewCard>
      <div className="min-h-96">
        {isNonSubscription ? (
          <a href="https://forms.gle/Md4kZmTsZHA2TqYz6">
            <img
              src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/nonsubscription-banner.jpg"
              alt="google form non subscription"
              className="mb-4 max-h-32 w-auto rounded-md"
            />
          </a>
        ) : (
          <a href="https://forms.gle/3bPTebm44vyF3HjD6">
            <img
              src="https://www.aipictors.com/wp-content/uploads/2023/11/gene-anke-banner-2.webp"
              alt="google form"
              className="mb-4 max-h-32 w-auto rounded-md"
            />
          </a>
        )}
        <a
          href="https://discord.com/invite/aipictors"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://www.aipictors.com/wp-content/themes/AISite/images/banner/discord-generation-banner-3.webp"
            alt="discord"
            className="mb-4 max-h-32 w-auto rounded-md"
          />
        </a>
      </div>
    </GenerationViewCard>
  )
}
