import { ParamsError } from "~/errors/params-error"
import { NovelArticle } from "~/routes/($lang)._main.novels.$novel/components/novel-article"
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
    <>
      <NovelArticle />
    </>
  )
}
