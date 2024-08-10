import type { FragmentOf } from "gql.tada"
import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  HomeAwardWorkSection,
  type HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeNewWorksTagSection } from "~/routes/($lang)._main._index/components/home-new-works-section"
import {
  HomeTagList,
  type HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  type HomeTagFragment,
  HomeTagsSection,
} from "~/routes/($lang)._main._index/components/home-tags-section"
import {
  type HomeTagWorkFragment,
  HomeWorksTagSection,
} from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"

type Props = {
  dailyThemeTitle?: string
  hotTags: FragmentOf<typeof HomeTagListItemFragment>[]
  firstTag: string
  firstTagWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  secondTag: string
  secondTagWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  awardDateText: string
  workAwards: FragmentOf<typeof HomeWorkAwardFragment>[]
  recommendedTags: FragmentOf<typeof HomeTagFragment>[]
  promotionWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  isSensitive?: boolean
}

/**
 * ホームのコンテンツ一覧
 */
export const HomeContents = (props: Props) => {
  const [newWorksPage, setNewWorksPage] = React.useState(0)

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(null)

  return (
    <Tabs defaultValue="home" className="space-y-4">
      <TabsList>
        <TabsTrigger value="home">ホーム</TabsTrigger>
        <TabsTrigger value="new">新着</TabsTrigger>
        <TabsTrigger value="follow">タイムライン</TabsTrigger>
        {/* 他のタブを追加する場合はここに追加 */}
      </TabsList>
      <TabsContent value="home" className="m-0 flex flex-col space-y-4">
        <div>
          <HomeTagList
            themeTitle={props.dailyThemeTitle}
            hotTags={props.hotTags}
          />
        </div>
        <HomeWorksTagSection
          isSensitive={props.isSensitive}
          tag={props.firstTag}
          works={props.firstTagWorks}
        />
        <HomeWorksTagSection
          tag={props.secondTag}
          works={props.secondTagWorks}
          isSensitive={props.isSensitive}
        />
        <HomeAwardWorkSection
          awardDateText={props.awardDateText}
          title={"前日ランキング"}
          awards={props.workAwards}
          isSensitive={props.isSensitive}
        />
        <HomeTagsSection title={"人気タグ"} tags={props.recommendedTags} />
        <HomeWorksUsersRecommendedSection
          isSensitive={props.isSensitive}
          works={props.promotionWorks}
        />
      </TabsContent>

      <TabsContent value="new">
        <div className="space-y-4">
          <Select
            value={workType ? workType : ""}
            onValueChange={(value) => {
              if (value === "ALL") {
                setWorkType(null)
                return
              }
              setWorkType(value as IntrospectionEnum<"WorkType">)
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={workType ? toWorkTypeText(workType) : "種類"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{"すべて"}</SelectItem>
              <SelectItem value="WORK">{"画像"}</SelectItem>
              <SelectItem value="VIDEO">{"動画"}</SelectItem>
              <SelectItem value="NOVEL">{"小説"}</SelectItem>
              <SelectItem value="COLUMN">{"コラム"}</SelectItem>
            </SelectContent>
          </Select>
          <HomeNewWorksTagSection
            page={newWorksPage}
            setPage={setNewWorksPage}
            isSensitive={props.isSensitive}
            workType={workType}
          />
        </div>
      </TabsContent>

      <TabsContent value="follow">
        <div className="flex h-32 items-center justify-center text-center">
          {"😢"}
          <br />
          {"ごめんなさい！工事中です！"}
        </div>
      </TabsContent>

      {/* 他のタブのコンテンツを追加する場合はここに追加 */}
    </Tabs>
  )
}
