import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { AppPage } from "@/_components/app/app-page"
import { ClientParamsError } from "@/errors/client-params-error"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  return {
    year,
    month,
  }
}

/**
 * ある月のランキングの履歴
 * @param props
 * @returns
 */
export default function MonthAwards() {
  const params = useParams()

  if (params.year === undefined) {
    throw new ClientParamsError()
  }

  if (params.month === undefined) {
    throw new ClientParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <RankingHeader year={data.year} month={data.month} day={0} />
    </AppPage>
  )
}
