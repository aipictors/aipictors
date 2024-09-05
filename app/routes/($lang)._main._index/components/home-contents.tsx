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
import {
  HomeAwardWorkSection,
  type HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeTagList,
  type HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagsSection,
  type HomeTagFragment,
} from "~/routes/($lang)._main._index/components/home-tags-section"
import {
  HomeWorksTagSection,
  type HomeTagWorkFragment,
} from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import { FeedContents } from "~/routes/($lang)._main._index/components/feed-contents"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import {
  HomeNewUsersWorksSection,
  type HomeNewUsersWorksFragment,
} from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"
import { HomeReleaseList } from "~/routes/($lang)._main._index/components/home-release-list"
import { Separator } from "~/components/ui/separator"
import { AppSideMenu } from "~/components/app/app-side-menu"
import type { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import type { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"

type homeParticles = {
  dailyThemeTitle: string
  hotTags: FragmentOf<typeof HomeTagListItemFragment>[]
  firstTag: string
  firstTagWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  secondTag: string
  secondTagWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  awardDateText: string
  workAwards: FragmentOf<typeof HomeWorkAwardFragment>[]
  recommendedTags: FragmentOf<typeof HomeTagFragment>[]
  promotionWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  newUserWorks: FragmentOf<typeof HomeNewUsersWorksFragment>[]
  releaseList?: MicroCmsApiReleaseResponse
  newPostedUsers?: FragmentOf<typeof HomeNewPostedUsersFragment>[]
  newComments?: FragmentOf<typeof HomeNewCommentsFragment>[]
}

type Props = {
  homeParticles?: homeParticles
  isSensitive?: boolean
  isCropped?: boolean
}

const useUpdateQueryParams = () => {
  const updateQueryParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}`
    window.history.replaceState(null, "", newUrl)
  }
  return updateQueryParams
}

/**
 * ホームのコンテンツ一覧
 */
export function HomeContents(props: Props) {
  const [searchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  const [newWorksPage, setNewWorksPage] = useState(0)

  const [feedPage, setFeedPage] = useState(0)

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

  return (
    <Tabs
      defaultValue={searchParams.get("tab") || "home"}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="home">{"ホーム"}</TabsTrigger>
        <TabsTrigger value="new">{"新着・人気"}</TabsTrigger>
        <TabsTrigger value="timeline">
          <div className="flex items-center space-x-2">
            <p>{"タイムライン"}</p>
            <CrossPlatformTooltip
              text={
                "フォローしたユーザ、お気に入り登録したタグの新着作品が表示されます"
              }
            />
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home" className="m-0 flex flex-col space-y-4">
        {!props.isSensitive && props.homeParticles && (
          <div className="block md:flex md:space-x-4">
            <div className="flex flex-col space-y-4 md:w-[80%]">
              <div className="hidden md:block">
                {props.homeParticles.releaseList && (
                  <HomeReleaseList
                    releaseList={props.homeParticles.releaseList}
                  />
                )}
              </div>
              <div>
                <HomeTagList
                  themeTitle={props.homeParticles.dailyThemeTitle}
                  hotTags={props.homeParticles.hotTags}
                />
              </div>
              <HomeWorksTagSection
                tag={props.homeParticles.firstTag}
                works={props.homeParticles.firstTagWorks}
                secondTag={props.homeParticles.secondTag}
                secondWorks={props.homeParticles.secondTagWorks}
                isSensitive={props.isSensitive}
                isCropped={props.isCropped}
              />
              <HomeNewUsersWorksSection
                works={props.homeParticles.newUserWorks}
                isSensitive={props.isSensitive}
              />
              {!props.isSensitive && (
                <HomeWorksUsersRecommendedSection
                  isSensitive={props.isSensitive}
                  works={props.homeParticles.promotionWorks}
                />
              )}
              <HomeAwardWorkSection
                awardDateText={props.homeParticles.awardDateText}
                title={"前日ランキング"}
                awards={props.homeParticles.workAwards}
                isSensitive={props.isSensitive}
              />
              <HomeTagsSection
                title={"人気タグ"}
                tags={props.homeParticles.recommendedTags}
                isSensitive={props.isSensitive}
              />
            </div>
            <Separator
              orientation="vertical"
              className="hidden h-[100vh] w-[1px] md:block"
            />
            <AppSideMenu
              homeParticles={props.homeParticles}
              isSensitive={props.isSensitive ?? false}
              isShowSensitiveButton={true}
              isShowGenerationAds={true}
            />
          </div>
        )}
        {props.isSensitive && props.homeParticles && (
          <>
            <div>
              <HomeTagList
                themeTitle={props.homeParticles.dailyThemeTitle}
                hotTags={props.homeParticles.hotTags}
              />
            </div>
            <HomeWorksTagSection
              tag={props.homeParticles.firstTag}
              works={props.homeParticles.firstTagWorks}
              secondTag={props.homeParticles.secondTag}
              secondWorks={props.homeParticles.secondTagWorks}
              isSensitive={props.isSensitive}
              isCropped={props.isCropped}
            />
            <HomeNewUsersWorksSection
              works={props.homeParticles.newUserWorks}
              isSensitive={props.isSensitive}
            />
            <HomeAwardWorkSection
              awardDateText={props.homeParticles.awardDateText}
              title={"前日ランキング"}
              awards={props.homeParticles.workAwards}
              isSensitive={props.isSensitive}
            />
            <HomeTagsSection
              title={"人気タグ"}
              tags={props.homeParticles.recommendedTags}
              isSensitive={props.isSensitive}
            />
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
            />
          </Suspense>
        </div>
      </TabsContent>

      <TabsContent value="timeline">
        <FeedContents
          isSensitive={props.isSensitive}
          page={feedPage}
          setPage={setFeedPage}
        />
      </TabsContent>
    </Tabs>
  )
}
