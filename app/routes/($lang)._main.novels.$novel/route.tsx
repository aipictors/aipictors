import { NovelArticle } from "@/[lang]/(main)/novels/[novel]/_components/novel-article"
import { AppPage } from "@/_components/app/app-page"
import { useParams } from "@remix-run/react"

/**
 * 小説の詳細
 * @returns
 */
export default function Novels() {
  const params = useParams()

  if (params.novel === undefined) {
    throw new Error()
  }

  return (
    <AppPage>
      <NovelArticle />
    </AppPage>
  )
}
