import type { FragmentOf } from "gql.tada"
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
import { useSearchParams } from "react-router-dom"
import {
  HomeTagList,
  type HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"
import { Separator } from "~/components/ui/separator"
import type { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import type { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { FollowTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-tags-feed-contents"
import { Button } from "~/components/ui/button"
import { ArrowDownWideNarrow } from "lucide-react"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { useTranslation } from "~/hooks/use-translation"
import {
  HomeSensitiveWorksTagSection,
  type HomeTagWorkFragment,
} from "~/routes/($lang)._main._index/components/home-sensitive-works-tag-section"
import {
  HomeSensitiveTagsSection,
  type HomeTagFragment,
} from "~/routes/($lang)._main._index/components/home-sensitive-tags-section"
import {
  type HomeNewUsersWorksFragment,
  HomeSensitiveNewUsersWorksSection,
} from "~/routes/($lang)._main._index/components/home-sensitive-new-users-works-section"
import {
  HomeSensitiveAwardWorkSection,
  type HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-sensitive-award-work-section"
import { AppSensitiveSideMenu } from "~/components/app/app-sensitive-side-menu"
import { HomeSensitiveWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-section"
import { HomeSensitiveHotWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-hot-works-section"
import { FollowSensitiveUserFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-user-feed-contents"

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
  const t = useTranslation()
  const [searchParams] = useSearchParams()

  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  const [newWorksPage, setNewWorksPage] = useState(0)

  const [followUserFeedPage, setFollowUserFeedPage] = useState(0)

  const [followTagFeedPage, setFollowTagFeedPage] = useState(0)

  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(null)

  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(null)

  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(null)

  useEffect(() => {
    if (isMounted) {
      return
    }

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

  const [workView, setWorkView] = useState(searchParams.get("view") || "new")

  const handleWorkViewChange = (view: string) => {
    setWorkView(view)
    searchParams.set("view", view)
    updateQueryParams(searchParams)
  }

  return (
    <Tabs
      defaultValue={searchParams.get("tab") || "home"}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="home">{t("ホーム", "Home")}</TabsTrigger>
        <TabsTrigger value="new">
          <p className="hidden md:block">{t("新着・人気", "New & Popular")}</p>
          <p className="block md:hidden">{t("新着", "New")}</p>
        </TabsTrigger>
        <TabsTrigger value="follow-user">
          <div className="flex items-center space-x-2">
            <p className="hidden md:block">
              {t("フォロー新着", "Followed Users")}
            </p>
            <p className="block md:hidden">{t("フォロー", "Followed")}</p>
            <CrossPlatformTooltip
              text={t(
                "フォローしたユーザの新着作品が表示されます",
                "Displays works from followed users",
              )}
            />
          </div>
        </TabsTrigger>
        <TabsTrigger value="follow-tag">
          <div className="flex items-center space-x-2">
            <p className="hidden md:block">
              {t("お気に入りタグ新着", "Favorite Tags")}
            </p>
            <p className="block md:hidden">{t("タグ", "Tags")}</p>
            <CrossPlatformTooltip
              text={t(
                "お気に入り登録したタグの新着作品が表示されます",
                "Displays works from favorite tags",
              )}
            />
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home" className="m-0 flex flex-col space-y-4">
        {props.homeParticles && (
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="flex flex-col space-y-4 md:w-[80%]">
              <div>
                <HomeTagList
                  themeTitle={props.homeParticles.dailyThemeTitle}
                  hotTags={props.homeParticles.hotTags}
                />
              </div>
              <HomeSensitiveWorksTagSection
                tag={props.homeParticles.firstTag}
                works={props.homeParticles.firstTagWorks}
                secondTag={props.homeParticles.secondTag}
                secondWorks={props.homeParticles.secondTagWorks}
                isCropped={props.isCropped}
              />
              <HomeSensitiveNewUsersWorksSection
                works={props.homeParticles.newUserWorks}
              />
              <HomeSensitiveAwardWorkSection
                awardDateText={props.homeParticles.awardDateText}
                title={t("前日ランキング", "Previous Day Ranking")}
                awards={props.homeParticles.workAwards}
              />
              <HomeSensitiveTagsSection
                title={t("人気タグ", "Popular Tags")}
                tags={props.homeParticles.recommendedTags}
              />
            </div>
            <Separator
              orientation="vertical"
              className="hidden h-[100vh] w-[1px] md:block"
            />
            <AppSensitiveSideMenu
              homeParticles={props.homeParticles}
              isShowSensitiveButton={true}
              isShowGenerationAds={true}
            />
          </div>
        )}
      </TabsContent>
      <TabsContent value="new" className="flex flex-col space-y-4">
        <div className="flex space-x-4">
          <Button
            variant={workView === "new" ? "default" : "secondary"}
            onClick={() => handleWorkViewChange("new")}
          >
            {t("新着", "New")}
          </Button>
          <Button
            variant={
              searchParams.get("view") === "popular" ? "default" : "secondary"
            }
            onClick={() => handleWorkViewChange("popular")}
          >
            <div className="flex space-x-2">
              <p>{t("人気", "Popular")}</p>
              <CrossPlatformTooltip
                text={t(
                  "最近投稿された人気作品が表示されます",
                  "Recently popular works",
                )}
              />
            </div>
          </Button>
        </div>
        {workView === "new" ? (
          <div className="space-y-4">
            {/* 新着作品の表示 */}
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
                    <SelectItem value="COLUMN">
                      {t("コラム", "Column")}
                    </SelectItem>
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
                      {t("コメント数", "Most Comments")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Suspense fallback={<AppLoadingPage />}>
                <HomeSensitiveWorksSection
                  page={newWorksPage}
                  setPage={setNewWorksPage}
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 人気作品の表示 */}
            <Suspense fallback={<AppLoadingPage />}>
              <HomeSensitiveHotWorksSection
                page={newWorksPage}
                setPage={setNewWorksPage}
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
              />
            </Suspense>
          </div>
        )}
      </TabsContent>

      <TabsContent value="follow-user">
        <Suspense fallback={<AppLoadingPage />}>
          <FollowSensitiveUserFeedContents
            page={followUserFeedPage}
            setPage={setFollowUserFeedPage}
          />
        </Suspense>
      </TabsContent>
      <TabsContent value="follow-tag">
        <Suspense fallback={<AppLoadingPage />}>
          <FollowTagsFeedContents
            page={followTagFeedPage}
            setPage={setFollowTagFeedPage}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
