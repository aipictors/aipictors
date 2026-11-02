import { AppCommonLayout } from "~/components/app/app-common-layout"
import { SensitiveAgeGate } from "~/components/sensitive/sensitive-age-gate"
import { SensitiveBlurToggle } from "~/components/sensitive/sensitive-blur"
import { META } from "~/config"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

/**
 * 子のルートに meta が無いときの既定（検索エンジンには載せない）
 * 公開の一覧は、それぞれのルートで index にする
 */
export const meta: MetaFunction = (props) =>
  createSensitiveMeta(META.SENSITIVE_DEFAULT, undefined, props.params.lang)

export default function SensitiveLayout () {
  return (
    <>
      <SensitiveAgeGate />
      <AppCommonLayout outlet={<Outlet />} />
      <SensitiveBlurToggle />
    </>
  )
}
