import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"

export function EventWakiaiaiFooter () {
  return (
    <footer className="container-shadcn-ui pt-4 pb-4">
      <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
        <p className="font-bold text-sm">
          © 2024 和気あいAI. All rights reserved.
        </p>
        <div className="flex gap-x-2">
          <Link to="https://twitter.com/waki_ai_ai_kot" className="text-sm">
            <Button>{"X（Twitter）"}</Button>
          </Link>
          <Link to="mailto:kotoba.no.aya.2022@gmail.com" className="text-sm">
            <Button>{"主催Mail"}</Button>
          </Link>
        </div>
      </div>
    </footer>
  )
}
