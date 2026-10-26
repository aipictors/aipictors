import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react"
import { ClientOnly } from "remix-utils/client-only"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { UserModelImportCallout } from "~/routes/($lang)._main.models.upload/components/user-model-import-callout"
import { UserModelUploadForm } from "~/routes/($lang)._main.models.upload/components/user-model-upload-form"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.USER_MODEL_UPLOAD, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function UserModelUploadPage() {
  return (
    <div className="mx-auto w-full max-w-(--breakpoint-xl) px-3 py-4 md:px-6 md:py-6">
      <div className="mb-6 space-y-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
        >
          <Link to="/models">
            <ArrowLeftIcon className="mr-1 size-4" />
            モデル一覧
          </Link>
        </Button>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          モデルをアップロード
        </h1>
        <p className="text-muted-foreground text-sm">
          LoRA やチェックポイントを公開すると、みんなが Aipictors
          の生成機で使えるようになります。
        </p>
        <section className="mt-3 rounded-xl border bg-muted/40 p-4 text-sm">
          <h2 className="mb-2 flex items-center gap-1.5 font-semibold">
            <ShieldCheckIcon className="size-4" />
            アップロードのルール
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground leading-relaxed">
            <li>
              自分が権利を持っている（再配布が許可されている）モデルのみアップロードできます
            </li>
            <li>実在の人物を再現するモデルはアップロードできません</li>
            <li>年齢区分は内容に合わせて正しく設定してください</li>
            <li>
              URL
              から取り込んだモデルには、元のモデルへのリンクと作者が表示されます
            </li>
            <li>
              ルールに違反したモデルは、運営の判断で非公開・削除することがあります
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground text-xs">
            詳しくは
            <Link to="/terms" className="mx-0.5 text-primary underline">
              利用規約
            </Link>
            をご確認ください。
          </p>
        </section>
      </div>
      <ClientOnly fallback={<div className="min-h-[60vh]" />}>
        {() => (
          <>
            <UserModelImportCallout />
            <UserModelUploadForm />
          </>
        )}
      </ClientOnly>
    </div>
  )
}
