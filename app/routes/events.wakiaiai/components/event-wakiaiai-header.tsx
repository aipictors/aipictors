import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { DarkModeButton } from "~/routes/($lang).creator/components/dark-mode-button"

type Props = {
  title: string
  noLatestEventLink?: boolean
}

export function EventWakiaiaiHeader(props: Props) {
  return (
    <>
      <header className="fixed z-50 flex w-full justify-center bg-card">
        <div
          className={
            "container-shadcn-ui flex w-full items-center justify-between gap-x-4 py-4"
          }
        >
          <h2 className="font-bold">{props.title}</h2>
          <div className="flex items-center gap-x-4" />
          <div className="flex gap-x-2">
            {!props.noLatestEventLink && (
              <Link className="hidden sm:block" to="/events/wakiaiai3">
                <Button variant={"secondary"}>{"和気あいAI3はこちら✨"}</Button>
              </Link>
            )}
            <DarkModeButton />
          </div>
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
