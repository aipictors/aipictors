import { Button } from "~/components/ui/button"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { XIntent } from "~/routes/($lang)._main.posts.$post/components/work-action-share-x"
import { Link } from "@remix-run/react"
import { useEffect } from "react"

type Props = {
  title: string | null
  isOpen: boolean
  imageBase64: string | null
  workId: string | null
  uuid: string | null
  shareTags: string[]
  createdAt: number
  accessType: IntrospectionEnum<"AccessType">
}

export const SuccessCreatedWorkDialog = (props: Props) => {
  const getRandomColor = () => {
    const colors = ["#ff0", "#ff8c00", "#e6e6fa", "#00f", "#8a2be2", "#ff69b4"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const createConfetti = (container: HTMLElement) => {
    Array.from({ length: 3 }).map(() => {
      const confetti = document.createElement("div")
      confetti.style.position = "absolute"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = getRandomColor()
      confetti.style.top = `${-50 + Math.random() * 50}px`
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.opacity = `${0.2 + Math.random() * 0.3}`
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`
      confetti.style.transition = `top ${2 + Math.random()}s ease-in, opacity ${
        2 + Math.random()
      }s ease-in`

      container.appendChild(confetti)

      setTimeout(() => {
        confetti.style.top = "100%"
        confetti.style.opacity = "0"
      }, 100)
    })
  }

  useEffect(() => {
    setTimeout(() => {
      const confettiContainer = document.getElementById(
        "confetti-container",
      ) as HTMLElement
      if (confettiContainer) {
        confettiContainer.innerHTML = ""
        createConfetti(confettiContainer)
        const interval = setInterval(() => {
          createConfetti(confettiContainer)
        }, 1000)
        return () => clearInterval(interval)
      }
    }, 1000)
  }, [props.isOpen, props.workId])

  const link = () => {
    if (props.accessType === "DRAFT" || props.accessType === "PRIVATE") {
      return `/posts/${props.workId}/draft`
    }
    if (props.accessType === "LIMITED") {
      return `/posts/${props.uuid}`
    }
    return `/posts/${props.workId}`
  }
  return (
    <>
      <Dialog
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // ページ遷移
            if (typeof document !== "undefined") {
              window.location.href = link()
            }
          }
        }}
        open={props.isOpen}
      >
        <DialogContent>
          <div className="relative h-40 w-full">
            <div
              id="confetti-container"
              className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
            />
            {props.imageBase64 && (
              <Link to={link()}>
                <img
                  className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-24 w-24 rounded-md object-cover transition-opacity duration-300 ease-in-out hover:opacity-80"
                  src={props.imageBase64}
                  alt="work-image"
                />
              </Link>
            )}
          </div>
          <p className="text-center font-bold">作品が更新されました</p>
          <p className="text-center text-sm opacity-80">この作品をシェアする</p>
          <div className="w-full">
            <XIntent
              text={`${props.title}\n`}
              url={`${
                props.uuid
                  ? `https://aipictors.com/works/${props.uuid}`
                  : `https://aipictors.com/works/${props.workId}`
              }\n`}
              hashtags={props.shareTags}
            />
          </div>
          <Button
            onClick={() => {
              if (typeof document !== "undefined") {
                window.location.href = link()
              }
            }}
            className="mt-2"
          >
            閉じる
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
