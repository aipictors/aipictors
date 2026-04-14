import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { type Dispatch, useEffect, useState } from "react"
import type { InferInput } from "valibot"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { PostFormItemAdvertising } from "~/routes/($lang)._main.new.image/components/post-form-item-advertising"
import { PostFormItemAlbum } from "~/routes/($lang)._main.new.image/components/post-form-item-album"
import { PostFormItemCaption } from "~/routes/($lang)._main.new.image/components/post-form-item-caption"
import { PostFormItemDate } from "~/routes/($lang)._main.new.image/components/post-form-item-date"
import { PostFormItemEnglish } from "~/routes/($lang)._main.new.image/components/post-form-item-english"
import { PostFormItemEvent } from "~/routes/($lang)._main.new.image/components/post-form-item-event"
import { PostFormItemFix } from "~/routes/($lang)._main.new.image/components/post-form-item-fix"
import { PostFormItemMd } from "~/routes/($lang)._main.new.image/components/post-form-item-md"
import { PostFormItemModel } from "~/routes/($lang)._main.new.image/components/post-form-item-model"
import { PostFormItemRating } from "~/routes/($lang)._main.new.image/components/post-form-item-rating"
import { PostFormItemRelatedLink } from "~/routes/($lang)._main.new.image/components/post-form-item-related-link"
import { PostFormItemTags } from "~/routes/($lang)._main.new.image/components/post-form-item-tags"
import { PostFormItemTaste } from "~/routes/($lang)._main.new.image/components/post-form-item-taste"
import { PostFormItemType } from "~/routes/($lang)._main.new.image/components/post-form-item-text-type"
import { PostFormItemTheme } from "~/routes/($lang)._main.new.image/components/post-form-item-theme"
import { PostFormItemTitle } from "~/routes/($lang)._main.new.image/components/post-form-item-title"
import { PostFormItemView } from "~/routes/($lang)._main.new.image/components/post-form-item-view"
import { PostFormPermissionSetting } from "~/routes/($lang)._main.new.image/components/post-form-permission-setting"
import type { vImageInformation } from "~/routes/($lang)._main.new.image/validations/image-information"
import type { PostTextFormInputAction } from "~/routes/($lang)._main.new.text/reducers/actions/post-text-form-input-action"
import type { PostTextFormInputState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-input-state"

type Props = {
  imageInformation: InferInput<typeof vImageInformation> | null
  dispatch: Dispatch<PostTextFormInputAction>
  state: PostTextFormInputState
  albums: FragmentOf<typeof PostTextFormAlbumFragment>[]
  currentPass: FragmentOf<typeof PostTextFormPassFragment> | null
  recentlyUsedTags: FragmentOf<typeof PostTextFormRecentlyUsedTagsFragment>[]
  eventInputHidden?: boolean
  setDisabledSubmit?: (value: boolean) => void
  themes: { date: string; title: string; id: string }[] | null
  events: {
    title: string | null
    description: string | null
    thumbnailImageUrl?: string | null
    headerImageUrl?: string | null
    tag: string | null
    ratings?: IntrospectionEnum<"Rating">[] | null
    endAt: number
    slug: string | null
    source: "OFFICIAL" | "USER"
  }[]
  aiModels: FragmentOf<typeof PostTextFormAiModelFragment>[]
  needFix: boolean
  mdUrl?: string
}

// 日本時間の日付を計算する関数
const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)

  const year = jstDate.getFullYear()
  const month = String(jstDate.getMonth() + 1).padStart(2, "0")
  const day = String(jstDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const allRatings: IntrospectionEnum<"Rating">[] = ["G", "R15", "R18", "R18G"]

const intersectRatings = (
  current: IntrospectionEnum<"Rating">[],
  next: IntrospectionEnum<"Rating">[],
) => current.filter((rating) => next.includes(rating))

export function PostTextFormInput(props: Props) {
  const t = useTranslation()
  const jstDate = getJSTDate()
  const reservationDate = props.state.reservationDate || jstDate
  const [isUserEventsVisible, setIsUserEventsVisible] = useState(false)

  const { data, loading } = useQuery(pageQuery, {
    variables: {
      isSensitive:
        props.state.ratingRestriction !== "R18" &&
        props.state.ratingRestriction !== "R18G",
      prompts: !props.imageInformation?.params.prompt
        ? "girl"
        : props.imageInformation.params.prompt,
    },
  })

  const [markdownContent, setMarkdownContent] = useState<string>("")

  useEffect(() => {
    if (props.setDisabledSubmit) {
      props.setDisabledSubmit(loading)
    }
  }, [loading])

  useEffect(() => {
    // マークダウンファイルの URL からマークダウンを取得する
    if (props.mdUrl) {
      fetch(props.mdUrl)
        .then((res) => res.text())
        .then((text) => {
          setMarkdownContent(text)
        })
        .catch((err) => console.error("Error fetching markdown file:", err))
    }
  }, [props.mdUrl])

  const onChangeTheme = (value: boolean) => {
    if (props.themes === null) {
      throw new Error("お題がありません。")
    }
    const theme = props.themes.find((theme) => theme.date === reservationDate)
    if (theme === undefined) {
      throw new Error("選択された日付にお題が見つかりませんでした。")
    }
    if (value === false) {
      props.dispatch({
        type: "SET_THEME_ID",
        payload: {
          themeId: null,
          themeTitle: theme.title,
        },
      })
      return
    }
    props.dispatch({
      type: "SET_THEME_ID",
      payload: {
        themeId: theme.id,
        themeTitle: theme.title,
      },
    })
  }

  /**
   * 選択可能なタグ
   */
  const tagOptions = () => {
    if (data?.whiteListTags === undefined) {
      return []
    }
    const tags = data.whiteListTags.filter((tag) => {
      return !props.state.tags.map((t) => t.text).includes(tag.name)
    })
    return tags.map((tag) => {
      return {
        id: tag.id,
        text: tag.name,
      }
    })
  }

  const recommendedTagOptions = () => {
    if (data === undefined) {
      return []
    }
    const tags = data.recommendedTagsFromPrompts.filter((tag) => {
      return !props.state.tags.map((t) => t.text).includes(tag.name)
    })

    return tags.map((tag) => {
      return {
        id: tag.id,
        text: tag.name,
      }
    })
  }

  const recentlyTagOptions = () => {
    return props.recentlyUsedTags.map((tag) => {
      return {
        id: tag.id,
        text: tag.name,
      }
    })
  }

  const albumOptions = () => {
    return props.albums.map((album) => {
      return {
        id: album.id,
        name: album.title,
      }
    })
  }

  const aiModelOptions = () => {
    return props.aiModels
      .filter((model) => model.workModelId !== null)
      .map((model) => {
        return {
          id: model.workModelId as string,
          name: model.name,
        }
      })
  }

  const officialEvents = props.events.filter(
    (event) => event.source === "OFFICIAL",
  )
  const userEvents = props.events.filter((event) => event.source === "USER")
  const selectedTagTexts = props.state.tags.map((tag) => tag.text)
  const matchedUserEvents = userEvents.filter(
    (event) => event.tag && selectedTagTexts.includes(event.tag),
  )
  const matchedUserEventAllowedRatings = matchedUserEvents
    .map((event) => event.ratings ?? allRatings)
    .reduce<IntrospectionEnum<"Rating">[]>((current, ratings, index) => {
      if (index === 0) {
        return ratings
      }

      return intersectRatings(current, ratings)
    }, allRatings)
  const hasNoSharedRatings =
    matchedUserEvents.length > 0 && matchedUserEventAllowedRatings.length === 0
  const allowedRatings =
    matchedUserEvents.length > 0 ? matchedUserEventAllowedRatings : allRatings
  const shouldAutoAdjustRating =
    allowedRatings.length === 1 ? allowedRatings[0] : null
  const ratingNote = hasNoSharedRatings
    ? t(
        "適用中のユーザーイベントタグ同士で共通の対象年齢種別がありません。イベントタグを見直してください。",
        "The applied user event tags do not share any common age category. Review the event tags.",
      )
    : matchedUserEvents.length > 0
      ? t(
          `イベントタグ適用中のため、年齢種別は ${allowedRatings.join(", ")} のみ選択できます。タグを外すと通常の選択に戻ります。`,
          `Because event tags are applied, only ${allowedRatings.join(", ")} can be selected. Remove the tag to restore normal selection.`,
        )
      : null

  useEffect(() => {
    if (
      !shouldAutoAdjustRating ||
      props.state.ratingRestriction === shouldAutoAdjustRating
    ) {
      return
    }

    props.dispatch({
      type: "SET_RATING_RESTRICTION",
      payload: shouldAutoAdjustRating,
    })
  }, [props.dispatch, props.state.ratingRestriction, shouldAutoAdjustRating])

  return (
    <div className="space-y-4">
      {props.needFix && (
        <PostFormItemFix
          onChange={(value) => {
            props.dispatch({ type: "SET_CORRECTION_MESSAGE", payload: value })
          }}
          value={props.state.correctionMessage ?? ""}
        />
      )}
      <PostFormItemTitle
        onChange={(title) => {
          props.dispatch({ type: "SET_TITLE", payload: title })
        }}
        value={props.state.title}
      />
      <PostFormItemCaption
        setCaption={(caption) => {
          props.dispatch({ type: "SET_CAPTION", payload: caption })
        }}
        caption={props.state.caption}
      />
      <PostFormItemEnglish
        onChangeTitle={(title) => {
          props.dispatch({ type: "SET_EN_TITLE", payload: title })
        }}
        onChangeCaption={(caption) => {
          props.dispatch({ type: "SET_EN_CAPTION", payload: caption })
        }}
        title={props.state.enTitle}
        caption={props.state.enCaption}
      />
      <PostFormItemMd
        label="本文"
        onChange={(value) => {
          props.dispatch({ type: "SET_MD", payload: value })
        }}
        value={markdownContent}
      />
      <PostFormItemRating
        rating={props.state.ratingRestriction}
        allowedRatings={allowedRatings}
        note={ratingNote}
        setRating={(value) => {
          props.dispatch({ type: "SET_RATING_RESTRICTION", payload: value })
        }}
      />
      <PostFormItemType
        type={props.state.type ?? "COLUMN"}
        setType={(type) => {
          props.dispatch({ type: "SET_TYPE", payload: type })
        }}
      />
      <PostFormItemView
        accessType={props.state.accessType}
        setAccessType={(accessType) => {
          props.dispatch({ type: "SET_ACCESS_TYPE", payload: accessType })
        }}
      />
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex-1">
          <PostFormItemTaste
            imageStyle={props.state.imageStyle}
            setImageStyle={(imageStyle) => {
              props.dispatch({ type: "SET_IMAGE_STYLE", payload: imageStyle })
            }}
          />
        </div>
        <div className="flex-1">
          <PostFormItemModel
            model={props.state.aiModelId}
            models={aiModelOptions()}
            setModel={(model) => {
              props.dispatch({ type: "SET_AI_MODEL_ID", payload: model })
            }}
          />
        </div>
      </div>
      <PostFormItemDate
        date={props.state.reservationDate}
        time={props.state.reservationTime}
        setDate={(value) => {
          props.dispatch({ type: "SET_RESERVATION_DATE", payload: value })
        }}
        setTime={(time) => {
          props.dispatch({ type: "SET_RESERVATION_TIME", payload: time })
        }}
      />
      {props.themes && (
        <PostFormItemTheme
          titles={props.themes.map((theme) => ({
            date: theme.date,
            title: theme.title,
          }))}
          targetDate={reservationDate}
          isLoading={loading}
          onChange={onChangeTheme}
          isChecked={
            props.state.themeId ===
            props.themes.find((theme) => theme.date === reservationDate)?.id
          }
        />
      )}
      {officialEvents.map((event) => (
        <div key={event.slug}>
          <PostFormItemEvent
            eventName={event.title ?? null}
            eventDescription={event.description ?? null}
            thumbnailImageUrl={
              event.thumbnailImageUrl ?? event.headerImageUrl ?? null
            }
            eventTag={event.tag ?? null}
            ratings={event.ratings ?? null}
            endAt={event.endAt ?? 0}
            slug={event.slug ?? null}
            addTag={(tag) => {
              props.dispatch({ type: "ADD_TAG", payload: tag })
            }}
            removeTag={(tag) => {
              props.dispatch({ type: "REMOVE_TAG", payload: tag.id })
            }}
            isAttending={props.state.tags.some((tag) => tag.text === event.tag)}
          />
        </div>
      ))}
      {userEvents.length > 0 && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-sm">
                {t("ユーザーイベント企画", "User-created events")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t(
                  "通常は閉じています。参加したい企画があるときだけ表示してください。",
                  "Hidden by default. Open this only when you want to join a user-created event.",
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUserEventsVisible((prev) => !prev)}
            >
              {isUserEventsVisible
                ? t("閉じる", "Hide")
                : t(
                    `見る（${userEvents.length}件）`,
                    `View (${userEvents.length})`,
                  )}
            </Button>
          </div>

          {isUserEventsVisible && (
            <div className="space-y-3">
              {userEvents.map((event) => (
                <div key={event.slug}>
                  <PostFormItemEvent
                    eventName={event.title ?? null}
                    eventDescription={event.description ?? null}
                    thumbnailImageUrl={
                      event.thumbnailImageUrl ?? event.headerImageUrl ?? null
                    }
                    eventTag={event.tag ?? null}
                    ratings={event.ratings ?? null}
                    endAt={event.endAt ?? 0}
                    slug={event.slug ?? null}
                    addTag={(tag) => {
                      props.dispatch({ type: "ADD_TAG", payload: tag })
                    }}
                    removeTag={(tag) => {
                      props.dispatch({ type: "REMOVE_TAG", payload: tag.id })
                    }}
                    isAttending={props.state.tags.some(
                      (tag) => tag.text === event.tag,
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <PostFormItemTags
        whiteListTags={tagOptions()}
        tags={props.state.tags}
        recentlyUsedTags={recentlyTagOptions()}
        recommendedTags={recommendedTagOptions()}
        onAddTag={(tag) => {
          props.dispatch({ type: "ADD_TAG", payload: tag })
        }}
        onRemoveTag={(tag) => {
          props.dispatch({ type: "REMOVE_TAG", payload: tag.id })
        }}
      />
      {loading && <Loader2Icon className="size-4 animate-spin" />}
      <PostFormPermissionSetting
        isTagEditableChecked={props.state.useTagFeature}
        onTagEditableChange={(value) => {
          props.dispatch({ type: "ENABLE_TAG_FEATURE", payload: value })
        }}
        isCommentsEditableChecked={props.state.useCommentFeature}
        onCommentsEditableChange={(value) => {
          props.dispatch({ type: "ENABLE_COMMENT_FEATURE", payload: value })
        }}
      />
      {props.albums.length !== 0 && (
        <PostFormItemAlbum
          album={props.state.albumId}
          albums={albumOptions()}
          setAlbumId={(albumId) => {
            props.dispatch({ type: "SET_ALBUM_ID", payload: albumId })
          }}
        />
      )}
      <PostFormItemRelatedLink
        link={props.state.link}
        onChange={(link) => {
          props.dispatch({ type: "SET_LINK", payload: link })
        }}
      />
      <PostFormItemAdvertising
        isSubscribed={
          props.currentPass?.type === "STANDARD" ||
          props.currentPass?.type === "PREMIUM"
        }
        isChecked={props.state.usePromotionFeature}
        onChange={(isAd) => {
          props.dispatch({ type: "ENABLE_PROMOTION_FEATURE", payload: isAd })
        }}
      />
    </div>
  )
}

export const PostTextFormAlbumFragment = graphql(
  `fragment PostTextFormAlbum on AlbumNode @_unmask {
    id
    title
  }`,
)

export const PostTextFormRecentlyUsedTagsFragment = graphql(
  `fragment PostTextFormRecentlyUsedTags on TagNode @_unmask {
    id
    name
  }`,
)

const pageQuery = graphql(
  `query PageQuery(
    $isSensitive: Boolean!
    $prompts: String!
  ) {
    whiteListTags(where: { isSensitive: $isSensitive }) {
      id
      name
    }
    recommendedTagsFromPrompts(prompts: $prompts) {
      id
      name
    }
  }`,
)

export const PostTextFormAiModelFragment = graphql(
  `fragment PostTextFormAiModel on AiModelNode @_unmask  {
    id
    name
    type
    generationModelId
    workModelId
    thumbnailImageURL
  }`,
)

export const PostTextFormPassFragment = graphql(
  `fragment PostTextFormPass on PassNode @_unmask {
    id
    type
  }`,
)
