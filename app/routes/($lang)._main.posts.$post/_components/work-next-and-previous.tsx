import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { WorkAdSense } from "@/routes/($lang)._main.posts.$post/_components/work-adcense"
import type { workArticleFragment } from "@/routes/($lang)._main.posts.$post/_components/work-article"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { HelpCircleIcon } from "lucide-react"
import { useEffect } from "react"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
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

const viewerCurrentPassQuery = graphql(
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
