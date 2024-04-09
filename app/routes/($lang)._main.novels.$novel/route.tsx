import { NovelArticle } from "@/[lang]/(main)/novels/[novel]/_components/novel-article"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * 小説の詳細
 * @returns
 */
export default function Novels() {
  return (
    <AppPage>
      <NovelArticle />
    </AppPage>
  )
}
