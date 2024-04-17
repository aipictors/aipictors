import { NovelArticle } from "@/[lang]/(main)/novels/[novel]/_components/novel-article"
import { AppPage } from "@/_components/app/app-page"
import { ClientParamsError } from "@/errors/client-params-error"
import { useParams } from "@remix-run/react"

/**
 * 小説の詳細
 */
export default function Novels() {
  const params = useParams()

  if (params.novel === undefined) {
    throw new ClientParamsError()
  }

  return (
    <AppPage>
      <NovelArticle />
    </AppPage>
  )
}
