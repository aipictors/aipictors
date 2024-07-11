import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { subWorkFieldsFragment } from "@/_graphql/fragments/sub-work-fields"
import { userFieldsFragment } from "@/_graphql/fragments/user-fields"
import { WorkAdSense } from "@/routes/($lang)._main.posts.$post/_components/work-adcense"
import { useQuery } from "@apollo/client/index"
import { graphql, type ResultOf } from "gql.tada"
import { HelpCircleIcon } from "lucide-react"
import { useEffect } from "react"

type Props = {
  work: ResultOf<typeof workQuery>["work"]
}

export const WorkNextAndPrevious = (props: Props) => {
  if (props.work === null) return null

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const passData = pass?.viewer?.currentPass

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (document !== undefined) {
        const activeElement = document.activeElement
        if (
          activeElement &&
          (activeElement.tagName.toLowerCase() === "input" ||
            activeElement.tagName.toLowerCase() === "textarea")
        ) {
          return
        }
      }

      if (typeof window !== "undefined") {
        if (e.code === "KeyQ" && props.work?.nextWork) {
          window.location.href = `/posts/${props.work?.nextWork.id}`
        }
        if (e.code === "KeyE" && props.work?.previousWork) {
          window.location.href = `/posts/${props.work?.previousWork.id}`
        }
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("keydown", keyDownHandler)
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", keyDownHandler)
      }
    }
  }, [props.work])

  return (
    <div className="invisible flex flex-col space-y-8 lg:visible">
      <div>
        <div className="flex py-2 text-md">
          <h2>{"前後の作品"}</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircleIcon className="ml-1 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{"[Q][E]キーで移動することもできます"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex justify-center space-x-2">
          {props.work.nextWork && (
            <CroppedWorkSquare
              workId={props.work.nextWork.id}
              imageUrl={props.work.nextWork.smallThumbnailImageURL}
              imageWidth={props.work.nextWork.smallThumbnailImageWidth}
              imageHeight={props.work.nextWork.smallThumbnailImageHeight}
              thumbnailImagePosition={
                props.work.nextWork.thumbnailImagePosition ?? 0
              }
              size={"sm"}
            />
          )}
          <div className="opacity-50">
            <CroppedWorkSquare
              workId={props.work.id}
              imageUrl={props.work.smallThumbnailImageURL}
              imageWidth={props.work.smallThumbnailImageWidth}
              imageHeight={props.work.smallThumbnailImageHeight}
              thumbnailImagePosition={props.work.thumbnailImagePosition ?? 0}
              size={"sm"}
            />
          </div>
          {props.work.previousWork && (
            <CroppedWorkSquare
              workId={props.work.previousWork.id}
              imageUrl={props.work.previousWork.smallThumbnailImageURL}
              imageWidth={props.work.previousWork.smallThumbnailImageWidth}
              imageHeight={props.work.previousWork.smallThumbnailImageHeight}
              thumbnailImagePosition={
                props.work.previousWork.thumbnailImagePosition ?? 0
              }
              size={"sm"}
            />
          )}
        </div>
      </div>
      {passData?.type !== "LITE" &&
        passData?.type !== "STANDARD" &&
        passData?.type !== "PREMIUM" &&
        passData?.type !== "TWO_DAYS" && <WorkAdSense />}
    </div>
  )
}

export const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      id
      isMyRecommended
      title
      accessType
      type
      adminAccessType
      promptAccessType
      rating
      description
      isSensitive
      enTitle
      enDescription
      imageURL
      largeThumbnailImageURL
      largeThumbnailImageWidth
      largeThumbnailImageHeight
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
      subWorksCount
      user {
        id
        promptonUser {
          id
        }
        ...UserFields
        isFollower
        isFollowee
        isMuted
        works(offset: 0, limit: 16) {
          id
          userId
          largeThumbnailImageURL
          largeThumbnailImageWidth
          largeThumbnailImageHeight
          smallThumbnailImageURL
          smallThumbnailImageWidth
          smallThumbnailImageHeight
          thumbnailImagePosition
          subWorksCount
        }
      }
      likedUsers(offset: 0, limit: 32) {
        id
        name
        iconUrl
        login
      }
      album {
        id
        title
        description
      }
      dailyTheme {
        id
        title
      }
      tagNames
      createdAt
      likesCount
      viewsCount
      commentsCount
      subWorks {
        ...SubWorkFields
      }
      nextWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
      }
      previousWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
      }
      model
      modelHash
      generationModelId
      workModelId
      isTagEditable
      isCommentsEditable
      isLiked
      isBookmarked
      isInCollection
      isPromotion
      isGeneration
      ogpThumbnailImageUrl
      prompt
      negativePrompt
      noise
      seed
      steps
      sampler
      scale
      strength
      vae
      clipSkip
      otherGenerationParams
      pngInfo
      style
      url
      html
      updatedAt
      dailyRanking
      weeklyRanking
      monthlyRanking
      relatedUrl
      nanoid
    }
  }`,
  [userFieldsFragment, subWorkFieldsFragment],
)

export const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)
