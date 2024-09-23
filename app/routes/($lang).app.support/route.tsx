import { json } from "@remix-run/react"
import { config } from "~/config"
import { AppFooter } from "~/routes/($lang).app._index/components/app-footer"

export default function Route() {
  return (
    <>
      <div className="flex min-h-screen justify-center py-8">
        <div>
          <p className="text-center">{"お問い合わせはこちらまで"}</p>
          <p className="text-center font-bold">hello@aipictors.com</p>
        </div>
      </div>
      <AppFooter />
    </>
  )
}

export async function loader() {
  return json({}, { headers: { "Cache-Control": config.cacheControl.oneDay } })
}
