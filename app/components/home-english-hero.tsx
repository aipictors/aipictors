import { useLocation } from "@remix-run/react"
import { SparklesIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import { getPathLocale } from "~/utils/locale-path"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"

const POINTS = [
  { value: "10", label: "free images every day" },
  { value: "700K+", label: "AI works with prompts" },
  { value: "200K+", label: "registered members" },
]

/**
 * 英語で初めて来た人への入口（ログインしていない人だけ）
 */
export function HomeEnglishHero() {
  const { pathname } = useLocation()
  const authContext = useContext(AuthContext)

  if (getPathLocale(pathname) !== "en" || authContext.isLoggedIn) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-linear-to-br from-violet-500/10 via-fuchsia-500/10 to-sky-500/10 p-5 md:p-8">
      <p className="flex items-center gap-1.5 font-semibold text-sm text-violet-600 dark:text-violet-300">
        <SparklesIcon className="size-4" />
        AI art community from Japan
      </p>
      <h2 className="mt-2 font-extrabold text-2xl leading-tight tracking-tight md:text-4xl">
        Generate anime-style AI art for free, and share it with people who love
        it
      </h2>
      <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed md:text-base">
        Pick a model, write a prompt in English, and get your images in seconds.
        Browse works with their prompts, reuse the settings you like, and post
        your own. Comments are translated automatically.
      </p>
      <div className="mt-4 grid max-w-xl grid-cols-3 gap-2">
        {POINTS.map((point) => (
          <div
            key={point.label}
            className="rounded-xl border bg-background/70 px-2 py-2.5 text-center"
          >
            <p className="font-extrabold text-lg md:text-xl">{point.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {point.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="rounded-xl">
          <Link to="/generation">Start generating for free</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-xl bg-background/70"
        >
          <Link to="/posts">Browse AI art</Link>
        </Button>
      </div>
      <p className="mt-3 text-muted-foreground text-xs">
        No credit card needed. Plans start at ¥480/mo ({toApproxUsdText(480)}),
        with your first month half price.{" "}
        <Link to="/plus" className="underline underline-offset-2">
          See plans
        </Link>
      </p>
    </section>
  )
}
