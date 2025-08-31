import { useEffect, type Dispatch } from "react"
import { PostFormItemModel } from "~/routes/($lang)._main.new.image/components/post-form-item-model"
import { PostFormItemRating } from "~/routes/($lang)._main.new.image/components/post-form-item-rating"
import { PostFormItemTaste } from "~/routes/($lang)._main.new.image/components/post-form-item-taste"
import { PostFormItemTitleCaption } from "~/routes/($lang)._main.new.image/components/post-form-item-title-caption"
import { useQuery } from "@apollo/client/index"
import { PostFormItemTheme } from "~/routes/($lang)._main.new.image/components/post-form-item-theme"
import { Checkbox } from "~/components/ui/checkbox"
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
import { PostFormItemGenerationParams } from "~/routes/($lang)._main.new.image/components/post-form-item-generation-params"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import { PostFormPermissionSetting } from "~/routes/($lang)._main.new.image/components/post-form-permission-setting"
import { PostFormItemEnglish } from "~/routes/($lang)._main.new.image/components/post-form-item-english"
import { PostFormItemFix } from "~/routes/($lang)._main.new.image/components/post-form-item-fix"
import { PostFormItemBotGrading } from "~/routes/($lang)._main.new.image/components/post-form-item-bot-grading"
import { AiEvaluationSection } from "~/routes/($lang)._main.posts.$post.image.edit._index/components/ai-evaluation-section"
import { useTranslation } from "~/hooks/use-translation" // 翻訳フックの使用

// AI評価セクション用のprops型
type AiEvaluationProps = {
  workId: string
  isAlreadyRequested?: boolean
  isAlreadyEvaluated?: boolean
  isBotGradingEnabled?: boolean
  currentBotGradingPublic?: boolean
  currentBotGradingRankingEnabled?: boolean
  smallThumbnailImageURL?: string
  userToken?: string | null
  onChangeBotGradingPublic: (isPublic: boolean) => void
  onChangeBotGradingRankingEnabled: (enabled: boolean) => void
}

type Props = {
  imageInformation: InferInput<typeof vImageInformation> | null
  dispatch: Dispatch<PostImageFormInputAction>
  state: PostImageFormInputState
  albums: FragmentOf<typeof PostImageFormAlbumFragment>[]
  currentPass: FragmentOf<typeof PostImageFormPassFragment> | null
  recentlyUsedTags: FragmentOf<typeof PostImageFormRecentlyUsedTagsFragment>[]
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
  aiModels: FragmentOf<typeof PostImageFormAiModelFragment>[]
  needFix: boolean
  isEditMode?: boolean
  // AI自動生成関連のprops
  imageBase64?: string | null
  token?: string | undefined | null
  onContentGenerated?: (data: {
    title?: string
    description?: string
    tags?: string[]
    titleEn?: string
    descriptionEn?: string
    tagsEn?: string[]
  }) => void
  // AI評価セクション用のprops
  aiEvaluationProps?: AiEvaluationProps
}

const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000
  const jstOffset = 9 * 60 * 60 * 1000
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)

  const year = jstDate.getFullYear()
  const month = String(jstDate.getMonth() + 1).padStart(2, "0")
  const day = String(jstDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function PostImageFormInput(props: Props) {
  const t = useTranslation() // 翻訳対応
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

  useEffect(() => {
    if (props.setDisabledSubmit) {
      props.setDisabledSubmit(loading)
    }
  }, [loading])

  const hasImageInfo = props.imageInformation

  const onChangeTheme = (value: boolean) => {
    if (props.themes === null) {
      throw new Error(t("お題がありません。", "No theme available."))
    }
    const theme = props.themes.find((theme) => theme.date === reservationDate)
    if (theme === undefined) {
      throw new Error(
        t(
          "選択された日付にお題が見つかりませんでした。",
          "No theme found for the selected date.",
        ),
      )
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

  const tagOptions = () => {
    if (data?.whiteListTags === undefined) {
      return []
    }
    const tags = data.whiteListTags.filter((tag) => {
      return !props.state.tags.map((t) => t.text).includes(tag.name)
    })
    return tags.map((tag) => ({
      id: tag.id,
      text: tag.name,
    }))
  }

  const recommendedTagOptions = () => {
    if (data === undefined) {
      return []
    }
    const tags = data.recommendedTagsFromPrompts.filter((tag) => {
      return !props.state.tags.map((t) => t.text).includes(tag.name)
    })

    return tags.map((tag) => ({
      id: tag.id,
      text: tag.name,
    }))
  }

  const recentlyUsedTags = () => {
    return props.recentlyUsedTags.map((tag) => ({
      id: tag.id,
      text: tag.name,
    }))
  }

  const albumOptions = () => {
    return props.albums.map((album) => ({
      id: album.id,
      name: album.title,
    }))
  }

  const aiModelOptions = () => {
    return props.aiModels
      .filter((model) => model.workModelId !== null)
      .map((model) => ({
        id: model.workModelId as string,
        name: model.name,
      }))
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("useGenerationParams")
      if (savedState !== null) {
        props.dispatch({
          type: "ENABLE_GENERATION_PARAMS_FEATURE",
          payload: JSON.parse(savedState),
        })
      }
    }
  }, [])

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
      <PostFormItemTitleCaption
        title={props.state.title}
        caption={props.state.caption}
        onTitleChange={(title) => {
          props.dispatch({ type: "SET_TITLE", payload: title })
        }}
        onCaptionChange={(caption) => {
          props.dispatch({ type: "SET_CAPTION", payload: caption })
        }}
        imageBase64={props.imageBase64 ?? null}
        token={props.token ?? null}
        onContentGenerated={props.onContentGenerated || (() => {})}
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
      <PostFormItemRating
        rating={props.state.ratingRestriction ?? undefined}
        setRating={(value) => {
          props.dispatch({ type: "SET_RATING_RESTRICTION", payload: value })
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
      {hasImageInfo && (
        <div className="flex items-center">
          {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
          <Checkbox
            checked={props.state.useGenerationParams}
            id="set-generation-check"
            onCheckedChange={(checked) => {
              props.dispatch({
                type: "ENABLE_GENERATION_PARAMS_FEATURE",
                payload: !props.state.useGenerationParams,
              })

              // localStorageに保存
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "useGenerationParams",
                  JSON.stringify(checked),
                )
              }
            }}
          />
          <label
            htmlFor="set-generation-check"
            className="ml-2 font-medium text-sm"
          >
            {t("生成情報を公開する", "Publish generation info")}
          </label>
        </div>
      )}

      {props.state.imageInformation && (
        <PostFormItemGenerationParams
          pngInfo={props.state.imageInformation}
          setPngInfo={(value) => {
            props.dispatch({
              type: "SET_IMAGE_INFORMATION",
              payload: value,
            })
          }}
        />
      )}
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
        recommendedTags={recommendedTagOptions()}
        recentlyUsedTags={recentlyUsedTags()}
        onAddTag={(tag) => {
          props.dispatch({ type: "ADD_TAG", payload: tag })
        }}
        onRemoveTag={(tag) => {
          props.dispatch({ type: "REMOVE_TAG", payload: tag.id })
        }}
        imageBase64={props.imageBase64 ?? null}
        token={props.token ?? null}
        onTagsGenerated={props.onContentGenerated}
      />
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
      {/* AI評価セクション - 編集モードでは専用コンポーネントを使用、新規投稿では標準コンポーネントを使用 */}
      {props.isEditMode && props.aiEvaluationProps ? (
        <AiEvaluationSection
          workId={props.aiEvaluationProps.workId}
          isAlreadyRequested={props.aiEvaluationProps.isAlreadyRequested}
          isAlreadyEvaluated={props.aiEvaluationProps.isAlreadyEvaluated}
          isBotGradingEnabled={props.aiEvaluationProps.isBotGradingEnabled}
          currentBotGradingPublic={
            props.aiEvaluationProps.currentBotGradingPublic
          }
          currentBotGradingRankingEnabled={
            props.aiEvaluationProps.currentBotGradingRankingEnabled
          }
          smallThumbnailImageURL={
            props.aiEvaluationProps.smallThumbnailImageURL
          }
          userToken={props.aiEvaluationProps.userToken}
          onChangeBotGradingPublic={
            props.aiEvaluationProps.onChangeBotGradingPublic
          }
          onChangeBotGradingRankingEnabled={
            props.aiEvaluationProps.onChangeBotGradingRankingEnabled
          }
        />
      ) : (
        <PostFormItemBotGrading
          isBotGradingEnabled={props.state.isBotGradingEnabled}
          isBotGradingPublic={props.state.isBotGradingPublic}
          isBotGradingRankingEnabled={props.state.isBotGradingRankingEnabled}
          botPersonality={props.state.botPersonality}
          botGradingType={props.state.botGradingType}
          isEditMode={props.isEditMode}
          onChangeBotGradingEnabled={(enabled) => {
            props.dispatch({
              type: "SET_BOT_GRADING_ENABLED",
              payload: enabled,
            })
          }}
          onChangeBotGradingPublic={(isPublic) => {
            props.dispatch({
              type: "SET_BOT_GRADING_PUBLIC",
              payload: isPublic,
            })
          }}
          onChangeBotGradingRankingEnabled={(enabled) => {
            props.dispatch({
              type: "SET_BOT_GRADING_RANKING_ENABLED",
              payload: enabled,
            })
          }}
          onChangeBotPersonality={(personality) => {
            props.dispatch({
              type: "SET_BOT_PERSONALITY",
              payload: personality,
            })
          }}
          onChangeBotGradingType={(type) => {
            props.dispatch({ type: "SET_BOT_GRADING_TYPE", payload: type })
          }}
        />
      )}
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

export const PostImageFormAlbumFragment = graphql(
  `fragment PostImageFormAlbum on AlbumNode @_unmask {
    id
    title
  }`,
)

export const PostImageFormRecentlyUsedTagsFragment = graphql(
  `fragment PostImageFormRecentlyUsedTags on TagNode @_unmask {
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

export const PostImageFormAiModelFragment = graphql(
  `fragment PostImageFormAiModel on AiModelNode @_unmask  {
    id
    name
    type
    generationModelId
    workModelId
    thumbnailImageURL
  }`,
)

export const PostImageFormPassFragment = graphql(
  `fragment PostImageFormPass on PassNode @_unmask {
    id
    type
  }`,
)
