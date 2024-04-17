import { NovelArticle } from "@/[lang]/(main)/novels/[novel]/_components/novel-article"
import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/errors/params-error"
import { useParams } from "@remix-run/react"

/**
 * 小説の詳細
 */
export default function Novels() {
  const params = useParams()

  if (params.novel === undefined) {
    throw new ParamsError()
  }

  return (
    <AppPage>
      <NovelArticle />
    </AppPage>
  )
}
