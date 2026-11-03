import { AppCanvas } from "~/routes/($lang).app._index/components/app-canvas"
import { Link } from "~/lib/app/locale-router"
import { BellIcon, HeartIcon, ImagePlusIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

export function AppAboutHeader () {
  const t = useTranslation()

  const features = [
    {
      Icon: BellIcon,
      title: t("通知を受け取る", "Get notified"),
      text: t(
        "いいねやコメントがどこにいても届きます",
        "Likes and comments reach you anywhere",
      ),
    },
    {
      Icon: HeartIcon,
      title: t("フォローをチェック", "Follow creators"),
      text: t(
        "フォローしているクリエーターの作品をすぐに見られます",
        "See works from creators you follow right away",
      ),
    },
    {
      Icon: ImagePlusIcon,
      title: t("作品を投稿", "Post your works"),
      text: t(
        "AIイラスト・AIフォト・AI小説を投稿できます",
        "Post AI illustrations, AI photos, and AI novels",
      ),
    },
  ]

  return (
    <div className="relative isolate mx-auto w-full overflow-hidden px-4 pb-16">
      <div className="absolute inset-0 top-[-8%] z-[-1] h-full w-full opacity-20">
        <AppCanvas />
      </div>
      <div className="relative flex justify-center pt-12 pb-8 md:pt-16">
        <img
          src="/icon.svg"
          alt=""
          width={256}
          height={256}
          fetchPriority="high"
          className="size-36 transition-transform duration-500 motion-safe:hover:rotate-6 motion-safe:hover:scale-105 md:size-52"
        />
      </div>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4">
            <h1 className="text-center font-bold text-3xl">
              {t("Aipictorsのアプリが登場", "The Aipictors App is Here")}
            </h1>
            <p className="leading-relaxed">
              {t(
                "AIイラスト投稿サイト「Aipictors」のSNS機能がアプリになりました。アプリならどこにいても通知を受け取ったりフォローしているクリエーターの作品をチェックできます。",
                "The AI illustration posting site 'Aipictors' now has an app! With the app, you can receive notifications and check the works of creators you follow wherever you are.",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <Link
            to="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636"
            className="motion-safe:hover:-translate-y-0.5 transition-transform"
          >
            <img
              src="/apple/download.svg"
              alt={t("App Storeからダウンロード", "Download on the App Store")}
              width={131}
              height={48}
              className="h-12 w-auto"
            />
          </Link>
          <Link
            to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja"
            className="motion-safe:hover:-translate-y-0.5 transition-transform"
          >
            <img
              src="/google/download.png"
              alt={t("Google Playで手に入れよう", "Get it on Google Play")}
              width={165}
              height={64}
              className="h-16 w-auto"
            />
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {features.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="rounded-2xl border bg-background/70 p-4 backdrop-blur-sm"
            >
              <Icon aria-hidden="true" className="mb-2 size-5 text-primary" />
              <h2 className="font-bold text-sm">{title}</h2>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                {text}
              </p>
            </li>
          ))}
        </ul>
        <div className="group flex items-start justify-center gap-2.5">
          <img
            src="https://assets.aipictors.com/pictorchanicon.webp"
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="motion-safe:group-hover:-rotate-6 size-10 shrink-0 rounded-full border bg-white object-cover transition-transform duration-300"
          />
          <p className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed">
            {t(
              "アプリでも、みんなの作品を巡回しています。向こうで会いましょう！",
              "I patrol everyone's works in the app too. See you there!",
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
