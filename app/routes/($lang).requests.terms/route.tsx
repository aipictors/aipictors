import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import termsMarkdownText from "~/assets/request-terms.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { LegalPageNav, LegalPageSummary } from "~/components/legal-page-nav"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.REQUESTS_TERMS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

/** 英語の画面向けの要約（正本は日本語の規約） */
const termsSummaryEn = `# Paid Request Terms (English summary)

This is a summary for convenience. The Japanese terms below are the official version and prevail in case of any difference. Matters not covered here follow the [Terms of Service](/terms), the [Premium Coin Terms](/premium-coins/policy), and the [Creator Rewards Terms](/creator-rewards/terms).

- **Parties**: The production contract is between the requester and the creator. Aipictors is not a party; it provides the place to apply, communicate, and deliver, and holds, returns, and settles coins.
- **Payment**: Requesters pay with coins and never send money to creators. When you apply, the price is deducted from your balance and held (free coins first, then premium coins). Prices are 100–100,000 coins per request.
- **Flow and deadlines**: The creator accepts or declines within 3 days, or the request expires. The due date is the plan's number of days from acceptance. Requesting a revision (within the plan's revision count) extends the due date by 3 days. If there is neither confirmation nor a revision request within 7 days of delivery, the request completes automatically. If nothing is delivered by the due date, the requester can withdraw; 3 days after the due date it is canceled automatically.
- **Refunds**: All held coins are returned, with no fee, when the request is declined, expires, is withdrawn before acceptance or after the due date, is canceled automatically, or is canceled by Aipictors. Coins are returned as the same type used. Returned premium coins do not expire; returned free coins expire 90 days after return. There are no cash refunds.
- **Completion and fees**: On completion, a 10% fee (rounded up to the nearest coin) is deducted and the rest goes to the creator. For all-ages (General/R15) requests where the creator participates in Creator Rewards, the portion paid with purchased premium coins (excluding bonuses) is recorded as a reward in yen; everything else (free coins, bonuses, R18 requests, or non-participants) goes to the creator as coins. After completion, coins cannot be reclaimed except as described under disputes.
- **Rights and use**: Copyright in deliveries stays with the creator unless otherwise agreed. Requesters may use deliveries privately and for non-commercial uses such as social media icons and headers. Commercial use, modification, and redistribution depend on the plan or what was agreed. Do not sell or transfer deliveries, or present them as your own work. Deliveries may be made using AI; creators should explain their methods in the plan.
- **Disputes**: First talk in the request messages; if unresolved, use "Report" on the request page. Aipictors may review and either cancel and return all coins, or complete and pay the creator.
- **Prohibited**: Images of real people without consent; copying others' works, characters, or styles; illegal content, including sexual depictions of anyone who appears to be a minor (even in R18); R18 requests to creators or plans that don't accept them (R18 deliveries need proper censoring); payment or contact outside the site; requests to yourself or your own accounts; reselling or redistributing deliveries; harassment or unfairly refusing deliveries; deliveries that don't meet the conditions, or reusing generated images without telling the requester. Violations may lead to cancellation, revoked rewards or coins, hidden plans, or account suspension.
- **Limits**: You cannot apply to users you block or who block you, or to yourself. Creators take up to 10 requests in total (within each plan's limit), and one requester can have up to 3 pending requests per creator.
- **Changes**: Aipictors may pause or change requests; requests in progress are handled to the end. If the service ends, held coins are returned to requesters. These terms may be changed with prior notice.

Effective: November 16, 2026

---
`

export default function RequestTermsPage() {
  const t = useTranslation()
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <LegalPageSummary path="/requests/terms" />
      {t.isEnglish && <AppMarkdown>{termsSummaryEn}</AppMarkdown>}
      <AppMarkdown>{termsMarkdownText}</AppMarkdown>
      <LegalPageNav currentPath="/requests/terms" />
    </div>
  )
}
