import { CroppedWorkSquare } from "~/components/cropped-work-square"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import type { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import type { FragmentOf } from "gql.tada"
import { HelpCircleIcon } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
}

export function WorkNextAndPrevious (props: Props) {
  const t = useTranslation()

  if (props.work === null) return null

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

      if (typeof document !== "undefined") {
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
    <>
      <div className="flex text-md">
        <h2>{t("前後の作品", "Next and Previous Works")}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="ml-1 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "[Q][E]キーで移動することもできます",
                  "You can also use the [Q][E] keys to navigate",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex space-x-4">
        {props.work.nextWork && (
          <div className="w-full">
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
          </div>
        )}

        {!props.work.nextWork && <div className="w-full" />}

        <div className="w-full opacity-50">
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
          <div className="w-full">
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
          </div>
        )}

        {!props.work.previousWork && <div className="w-full" />}
      </div>
    </>
  )
}
