import type { MetaFunction } from "@remix-run/cloudflare"
import termsMarkdownText from "~/assets/image-generation-terms.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.GENERATION_TERMS)
}

/**
 * 画像生成機能の利用規約
 */
export default function GenerationTerms() {
  return (
    <>
      <div className="w-full space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/generation">生成トップ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/generation/about">
                生成機能について
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/generation/terns">利用規約</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="font-bold text-2xl">{"利用規約"}</h1>
        <AppMarkdown>{termsMarkdownText}</AppMarkdown>
      </div>
    </>
  )
}
