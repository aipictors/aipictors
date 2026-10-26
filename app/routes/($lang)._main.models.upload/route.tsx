import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { ArrowLeftIcon } from "lucide-react"
import { ClientOnly } from "remix-utils/client-only"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
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
      </div>
      <ClientOnly fallback={<div className="min-h-[60vh]" />}>
        {() => <UserModelUploadForm />}
      </ClientOnly>
    </div>
  )
}
