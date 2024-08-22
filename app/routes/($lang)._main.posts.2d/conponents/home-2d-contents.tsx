import type { FragmentOf } from "gql.tada"
import { ArrowDownWideNarrow } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { useSearchParams } from "react-router-dom"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import {
  HomeWorksTagSection,
  type HomeTagWorkFragment,
} from "~/routes/($lang)._main._index/components/home-works-tag-section"

type homeParticles = {
  firstTag: string
  firstTagWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  secondTag: string
  secondTagWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  promotionWorks: FragmentOf<typeof HomeTagWorkFragment>[]
}

type Props = {
  homeParticles?: homeParticles
  isSensitive?: boolean
}

const useUpdateQueryParams = () => {
  const updateQueryParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}`
    window.history.replaceState(null, "", newUrl)
  }
  return updateQueryParams
}

/**
 * 2Dホームのコンテンツ一覧
 */
export function Home2dContents(props: Props) {
  const [searchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  const [newWorksPage, setNewWorksPage] = useState(0)
  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(null)
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(null)
  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(null)

  useEffect(() => {
    if (!searchParams.toString() || searchParams.get("tab") === "home") {
      return
    }

    const page = searchParams.get("page")
    if (page) {
      const pageNumber = Number.parseInt(page)
      if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > 100) {
      } else {
        setNewWorksPage(pageNumber)
      }
    } else {
      setNewWorksPage(0)
    }

    const type = searchParams.get("workType")
    if (type) setWorkType(type as IntrospectionEnum<"WorkType">)

    const prompt = searchParams.get("isPromptPublic")
    if (prompt)
      setIsPromptPublic(
        prompt === "true" ? true : prompt === "false" ? false : null,
      )

    const sort = searchParams.get("sortType")
    if (sort) setSortType(sort as IntrospectionEnum<"WorkOrderBy">)

    setIsMounted(true)
  }, [searchParams])

  // newWorksPageが変更されたときにURLパラメータを更新
  useEffect(() => {
    if (!searchParams.toString() || searchParams.get("tab") === "home") {
      return
    }

    if (newWorksPage >= 0) {
      searchParams.set("page", newWorksPage.toString())
      updateQueryParams(searchParams)
    }
  }, [newWorksPage, searchParams, updateQueryParams])

  const handleTabChange = (tab: string) => {
    searchParams.set("tab", tab)
    updateQueryParams(searchParams)
  }

  const handleWorkTypeChange = (value: string) => {
    if (value === "ALL") {
      searchParams.delete("workType")
      setWorkType(null)
    } else {
      searchParams.set("workType", value)
      setWorkType(value as IntrospectionEnum<"WorkType">)
    }

    // ページ番号を0にリセット
    setNewWorksPage(0)
    searchParams.set("page", "0")
    updateQueryParams(searchParams)
  }

  const handlePromptChange = (value: string) => {
    if (value === "ALL") {
      searchParams.delete("isPromptPublic")
      setIsPromptPublic(null)
    } else {
      const isPrompt = value === "prompt"
      searchParams.set("isPromptPublic", isPrompt ? "true" : "false")
      setIsPromptPublic(isPrompt)
    }
    updateQueryParams(searchParams)
  }

  const handleSortTypeChange = (value: string) => {
    if (value === "ALL") {
      searchParams.delete("sortType")
      setSortType(null)
    } else {
      searchParams.set("sortType", value)
      setSortType(value as IntrospectionEnum<"WorkOrderBy">)
    }
    updateQueryParams(searchParams)
  }

  // ハイドレーションエラー対策
  // if (
  //   !isMounted &&
  //   searchParams.get("tab") &&
  //   searchParams.get("tab") !== "home"
  // ) {
  //   return null
  // }

  return (
    <Tabs
      defaultValue={searchParams.get("tab") || "home"}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="home">ホーム</TabsTrigger>
        <TabsTrigger value="new">2D作品一覧</TabsTrigger>
      </TabsList>
      <TabsContent value="home" className="m-0 flex flex-col space-y-4">
        {props.homeParticles && (
          <>
            <HomeWorksTagSection
              tag={props.homeParticles.firstTag}
              works={props.homeParticles.firstTagWorks}
              isSensitive={props.isSensitive}
              style="ILLUSTRATION"
            />
            <HomeWorksTagSection
              tag={props.homeParticles.secondTag}
              works={props.homeParticles.secondTagWorks}
              isSensitive={props.isSensitive}
              style="ILLUSTRATION"
            />
            {!props.isSensitive && (
              <HomeWorksUsersRecommendedSection
                isSensitive={props.isSensitive}
                works={props.homeParticles.promotionWorks}
                style="ILLUSTRATION"
              />
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="new">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Select
              value={workType ? workType : ""}
              onValueChange={handleWorkTypeChange}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={workType ? toWorkTypeText(workType) : "種類"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{"種類"}</SelectItem>
                <SelectItem value="WORK">{"画像"}</SelectItem>
                <SelectItem value="VIDEO">{"動画"}</SelectItem>
                <SelectItem value="NOVEL">{"小説"}</SelectItem>
                <SelectItem value="COLUMN">{"コラム"}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                isPromptPublic === null
                  ? "ALL"
                  : isPromptPublic
                    ? "prompt"
                    : "no-prompt"
              }
              onValueChange={handlePromptChange}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isPromptPublic === null
                      ? "プロンプト有無"
                      : isPromptPublic
                        ? "あり"
                        : "なし"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{"プロンプト有無"}</SelectItem>
                <SelectItem value="prompt">{"あり"}</SelectItem>
                <SelectItem value="no-prompt">{"なし"}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortType ? sortType : ""}
              onValueChange={handleSortTypeChange}
            >
              <SelectTrigger>
                <ArrowDownWideNarrow />
                <SelectValue placeholder={sortType ? sortType : "最新"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_CREATED">{"最新"}</SelectItem>
                <SelectItem value="LIKES_COUNT">{"最も人気"}</SelectItem>
                <SelectItem value="COMMENTS_COUNT">{"コメント数"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Suspense fallback={<AppLoadingPage />}>
            <HomeWorksSection
              page={newWorksPage}
              setPage={setNewWorksPage}
              isSensitive={props.isSensitive}
              workType={workType}
              isPromptPublic={isPromptPublic}
              sortType={sortType}
              style="ILLUSTRATION"
            />
          </Suspense>
        </div>
      </TabsContent>
    </Tabs>
  )
}
