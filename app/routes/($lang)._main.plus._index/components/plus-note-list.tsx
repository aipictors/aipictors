import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

export function PlusNoteList () {
  const t = useTranslation()

  return (
    <ul className="ml-6 list-disc space-y-2">
      <li>
        {t(
          "本プランの加入期間は、加入日から翌月同日までの1か月間となります。加入期間満了日までにお客様が自ら解約しない限り、本プランの加入期間は翌日から同一期間更新したものとみなし、以後同様とします。",
          "The subscription period of this plan is one month, starting from the subscription date to the same date of the following month. Unless the customer cancels the plan before the expiration date, the subscription will automatically renew for the same period starting from the next day, and this will continue.",
        )}
      </li>
      <li>
        {t(
          "お客様は当社指定方法に基づき申し出ることで、いつでも本プランを解約することができます。",
          "Customers can cancel this plan at any time by following the method designated by the company.",
        )}
      </li>
      <li>
        {t(
          "解約を申し出る場合は、解約手続きの完了日以降に到来する加入期間満了日をもって、本プランは終了します。",
          "When requesting cancellation, the plan will terminate upon the expiration of the subscription period following the completion of the cancellation process.",
        )}
      </li>
      <li>
        {t(
          "加入期間の途中で、本料金の金額が変更される場合があっても、本料金の日割り計算は行いません。",
          "Even if the subscription fee is changed during the subscription period, the fee will not be prorated.",
        )}
      </li>
      <li>
        {t(
          "お客様は本プランの解約を申し出た場合は、これを撤回または取り消すことはできません。",
          "Once the customer requests to cancel the plan, they cannot revoke or withdraw the request.",
        )}
      </li>
      <li>
        {t(
          "本プランの特典は加入期間を過ぎると全て無効となります。",
          "The benefits of this plan will all become invalid after the subscription period has passed.",
        )}
      </li>
      <li>
        {t(
          "生成サービスの提供はベストエフォートです。待ち時間により上限まで生成することに時間がかかることがあります。",
          "The provision of the generation service is on a best-effort basis. It may take time to reach the upper limit of generation due to wait times.",
        )}
      </li>
      <li>
        {t(
          "システム障害などが発生した場合でも返金や期間の延長は原則行うことができません。予めご了承下さい。",
          "Even in the event of system failures, refunds or extensions of the period cannot be provided in principle. Please understand this in advance.",
        )}
      </li>
      <li>
        {t(
          "プロンプトの指定が適切でなく意図した画像が生成できない、StableDiffusion側での生成がうまくいかず真っ黒画像が生成されるなど、生成処理を実行したものの、生成がうまくいかないケースについてはエラーとはみなしません。利用者側で工夫してご対応下さい。",
          "If the prompt specification is not appropriate and the intended image cannot be generated, or if the generation on the StableDiffusion side does not go well and a black image is generated, these cases are not considered errors. Please address these issues on the user side.",
        )}
      </li>
      <li>
        {t(
          "規約違反の利用をした場合、生成機能の利用は禁止いたします。その場合も返金対応等は一切行いません。",
          "If the service is used in violation of the terms, the use of the generation function will be prohibited. In such cases, no refund or compensation will be provided.",
        )}
      </li>
      <li>
        {t(
          "本プランは何らかの理由により内容を変更し、又は廃止する場合があります。変更後の内容がお客様の権利関係に重大な影響を与える場合又は本プランを廃止する場合は事前に通知、お知らせいたします。緊急性がある場合又はやむをえない場合は事後的に通知いたします。",
          "This plan may be modified or abolished for various reasons. If the modifications significantly affect the rights of the customer, or if the plan is discontinued, prior notice will be given. In cases of urgency or unavoidable circumstances, notice will be provided afterwards.",
        )}
      </li>
      <li>
        {t(
          "本プランに関し、規約違反に反する行為又は該当する恐れのある行為が確認された場合は特典を停止することがあります。AIイラスト生成で規約違反が発覚した場合はAIイラスト生成機能の停止となる場合がございます。詳細は当サービスの規約（",
          "If actions that violate the terms or are suspected to violate the terms are confirmed regarding this plan, benefits may be suspended. If a violation of the terms regarding AI illustration generation is detected, the AI illustration generation function may be suspended. For details, please refer to our terms of service (",
        )}
        <Link to={"https://www.aipictors.com/terms"}>
          {"https://www.aipictors.com/terms"}
        </Link>
        {t("）をご確認下さい。", ").")}
      </li>
    </ul>
  )
}
