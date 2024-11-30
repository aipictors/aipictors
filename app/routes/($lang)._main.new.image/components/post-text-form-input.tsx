import { useEffect, useState, type Dispatch } from "react"
import { PostFormItemModel } from "~/routes/($lang)._main.new.image/components/post-form-item-model"
import { PostFormItemRating } from "~/routes/($lang)._main.new.image/components/post-form-item-rating"
import { PostFormItemTaste } from "~/routes/($lang)._main.new.image/components/post-form-item-taste"
import { PostFormItemTitle } from "~/routes/($lang)._main.new.image/components/post-form-item-title"
import { useQuery } from "@apollo/client/index"
import { PostFormItemTheme } from "~/routes/($lang)._main.new.image/components/post-form-item-theme"
import { Loader2Icon } from "lucide-react"
import { PostFormItemCaption } from "~/routes/($lang)._main.new.image/components/post-form-item-caption"
import { PostFormItemView } from "~/routes/($lang)._main.new.image/components/post-form-item-view"
import { PostFormItemDate } from "~/routes/($lang)._main.new.image/components/post-form-item-date"
import { PostFormItemTags } from "~/routes/($lang)._main.new.image/components/post-form-item-tags"
import { PostFormItemEvent } from "~/routes/($lang)._main.new.image/components/post-form-item-event"
import { PostFormItemRelatedLink } from "~/routes/($lang)._main.new.image/components/post-form-item-related-link"
import { PostFormItemAlbum } from "~/routes/($lang)._main.new.image/components/post-form-item-album"
import { PostFormItemAdvertising } from "~/routes/($lang)._main.new.image/components/post-form-item-advertising"
import { type FragmentOf, graphql } from "gql.tada"
import type { vImageInformation } from "~/routes/($lang)._main.new.image/validations/image-information"
import type { InferInput } from "valibot"
import { PostFormPermissionSetting } from "~/routes/($lang)._main.new.image/components/post-form-permission-setting"
import { PostFormItemEnglish } from "~/routes/($lang)._main.new.image/components/post-form-item-english"
import type { PostTextFormInputAction } from "~/routes/($lang)._main.new.text/reducers/actions/post-text-form-input-action"
import type { PostTextFormInputState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-input-state"
import { PostFormItemMd } from "~/routes/($lang)._main.new.image/components/post-form-item-md"
import { PostFormItemType } from "~/routes/($lang)._main.new.image/components/post-form-item-text-type"
import { PostFormItemFix } from "~/routes/($lang)._main.new.image/components/post-form-item-fix"

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
    tag: string | null
    endAt: number
    slug: string | null
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

export function PostTextFormInput(props: Props) {
  const jstDate = getJSTDate()
  const reservationDate = props.state.reservationDate || jstDate

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
      {props.events.map((event) => (
        <div key={event.slug}>
          <PostFormItemEvent
            eventName={event.title ?? null}
            eventDescription={event.description ?? null}
            eventTag={event.tag ?? null}
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
      {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
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
