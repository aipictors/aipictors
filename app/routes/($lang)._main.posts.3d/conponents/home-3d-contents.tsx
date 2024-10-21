import { graphql, type FragmentOf } from "gql.tada"
import { ArrowDownWideNarrow } from "lucide-react"
import { Suspense, useContext, useEffect, useState } from "react"
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
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import {
  HomeWorksTagSection,
  type HomeTagWorkFragment,
} from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { useTranslation } from "~/hooks/use-translation"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"

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
 * 3Dホームのコンテンツ一覧
 */
export function Home3dContents(props: Props) {
  const t = useTranslation()

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

  const appContext = useContext(AuthContext)

  // 推薦作品
  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.promotion,
      where: {
        isRecommended: true,
        ratings: ["G", "R15"],
        style: "REAL",
        isNowCreatedAt: true,
      },
    },
  })

  const workDisplayed =
    recommendedWorksResp?.works ?? props.homeParticles?.promotionWorks

  return (
    <Tabs
      defaultValue={searchParams.get("tab") || "home"}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="home">{t("ホーム", "Home")}</TabsTrigger>
        <TabsTrigger value="new">
          {t("3D作品一覧", "3D Works List")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home" className="m-0 flex flex-col space-y-4">
        {props.homeParticles && (
          <>
            <HomeWorksTagSection
              tag={props.homeParticles.firstTag}
              works={props.homeParticles.firstTagWorks}
              secondTag={props.homeParticles.secondTag}
              secondWorks={props.homeParticles.secondTagWorks}
              style="REAL"
            />
            {workDisplayed !== undefined && workDisplayed?.length > 0 && (
              <HomeRecommendedWorkList
                title={t("ユーザからの推薦", "Recommended by users")}
                works={workDisplayed}
                isCropped={false}
                link={
                  "https://www.aipictors.com/search/?query=%7B%22keyword%22%3A%22%23%23%E6%8E%A8%E8%96%A6%E4%BD%9C%E5%93%81%22%2C%22options%22%3A%7B%22age%22%3A%5B%220%22%2C%223%22%2C%221%22%2C%222%22%5D%2C%22posttype%22%3A%5B%22image%22%2C%22novel%22%2C%22column%22%2C%22video%22%5D%2C%22target%22%3A%5B%22category%22%2C%22title%22%2C%22explanation%22%2C%22prompt%22%2C%22owner%22%5D%2C%22service%22%3A%22%22%2C%22model%22%3A%22%22%2C%22prompt%22%3A%5B%220%22%2C%221%22%2C%222%22%5D%2C%22follow%22%3A%5B%220%22%2C%221%22%5D%2C%22subject%22%3A%5B%220%22%2C%221%22%5D%2C%22taste%22%3A%5B%221%22%2C%222%22%2C%223%22%5D%2C%22post-since%22%3A%22%22%2C%22post-until%22%3A%22%22%2C%22collabid%22%3A%22%22%2C%22order%22%3A%22new%22%2C%22limit%22%3A%22100%22%2C%22offset%22%3A0%7D%7D&next=1"
                }
                isShowProfile={true}
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
                  placeholder={
                    workType ? toWorkTypeText(workType) : t("種類", "Type")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("種類", "Type")}</SelectItem>
                <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
                <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
                <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
                <SelectItem value="COLUMN">{t("コラム", "Column")}</SelectItem>
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
                      ? t("プロンプト有無", "Prompt")
                      : isPromptPublic
                        ? t("あり", "Yes")
                        : t("なし", "No")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t("プロンプト有無", "Prompt")}
                </SelectItem>
                <SelectItem value="prompt">{t("あり", "Yes")}</SelectItem>
                <SelectItem value="no-prompt">{t("なし", "No")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortType ? sortType : ""}
              onValueChange={handleSortTypeChange}
            >
              <SelectTrigger>
                <ArrowDownWideNarrow />
                <SelectValue
                  placeholder={sortType ? sortType : t("最新", "Latest")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_CREATED">
                  {t("最新", "Latest")}
                </SelectItem>
                <SelectItem value="LIKES_COUNT">
                  {t("最も人気", "Most Liked")}
                </SelectItem>
                <SelectItem value="COMMENTS_COUNT">
                  {t("コメント数", "Most Commented")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Suspense fallback={<AppLoadingPage />}>
            <HomeWorksSection
              page={newWorksPage}
              setPage={setNewWorksPage}
              workType={workType}
              isPromptPublic={isPromptPublic}
              sortType={sortType}
              style="REAL"
            />
          </Suspense>
        </div>
      </TabsContent>
    </Tabs>
  )
}

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomePromotionWork
    }
  }`,
  [HomePromotionWorkFragment],
)
