import text from "~/assets/specified-commercial-transaction-act.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    META.SPECIFIED_COMMERCIAL_TRANSACTION,
    undefined,
    props.params.lang,
  )
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const company = [
    {
      title: "商号",
      content: "Aipictors株式会社",
      enContent: "AIPICTORS K.K.",
    },
    {
      title: "住所",
      content: "大阪府大阪市北区梅田１丁目２番２号大阪駅前第２ビル１２－１２",
      enContent: "1-2-2 Osaka Station Building 2 12-12 Umeda Kita-ku",
    },
    {
      title: "代表取締役",
      content: "中塚季利人",
      enContent: "KIRITO NAKATSUKA",
    },
  ]

  return {
    text,
    company,
  }
}

export default function SpecifiedCommercialTransactionActPage() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (data === null) {
    return null
  }

  return (
    <>
      <article>
        <h1 className="py-4 font-bold text-xl">
          {t(
            "特定商取引法に基づく表記",
            "Specified Commercial Transaction Act",
          )}
        </h1>
        <h2 className="py-4 font-bold text-md">
          {t("会社情報", "Company Information")}
        </h2>
        <Table>
          <TableCaption>{t("会社情報", "Company Information")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[96px]">
                {t("タイトル", "Title")}
              </TableHead>
              <TableHead>{t("Japanese", "Japanese")}</TableHead>
              <TableHead>{t("English", "English")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.company.map((item) => (
              <TableRow key={null}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.content}</TableCell>
                <TableCell>{item.enContent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h2 className="py-4 font-bold text-md">
          {t("事業内容", "Business Description")}
        </h2>
        <h3 className="py-4">
          {t("コンテンツプラットフォーム", "Content Platform")}
        </h3>
        <p>
          {t(
            "「Aipictors」 AIコンテンツに出会えるプラットフォームを提供しています。 新しいクリエイター、ユーザとのコミュニケーションを支えます。",
            "We provide a platform where you can discover AI-generated content with Aipictors, supporting communication with new creators and users.",
          )}
        </p>
        <h2 className="py-4 font-bold text-md">
          {t(
            "特定商取引法に基づく表記",
            "Specified Commercial Transaction Act",
          )}
        </h2>
        <AppMarkdown>{data.text}</AppMarkdown>
      </article>
    </>
  )
}
