import { AppPage } from "@/_components/app/app-page"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ title: "本サイトについて" }]
}

/**
 * サイトについて
 */
export default function About() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">{"本サイトについて"}</h1>
        <h2 className="py-2 font-bold text-md">当サービスについて</h2>
        <p>
          当サービスはAIで生成されたイラストのコンテンツをテーマにコミュニケーション、創作活動するプラットフォームです。
        </p>
        <h2 className="py-2 font-bold text-md">運営会社について</h2>
        <p>
          Aipictors株式会社が運営しております。お問い合わせは
          hello@aipictors.com からお願い致します。
        </p>
        <h2 className="py-2 font-bold text-md">お問い合わせ先</h2>
        <Link to="/contact">こちら</Link>
        <h2 className="py-2 font-bold text-md">プライバシーポリシー</h2>
        <Link to="/privacy">個人情報の利用目的などについて</Link>
        <h2 className="py-2 font-bold text-md">利用規約</h2>
        <p>
          {"サービスのご利用にあたっては"}
          <Link to="/terms">こちら</Link>
          {"をご参照ください"}
        </p>
        <h2 className="py-2 font-bold text-md">ガイドライン</h2>
        <p>
          {"機能の使い方は"}
          <Link to="/guideline">こちら</Link>
          {"をご参照ください"}
        </p>
        <h2 className="py-2 font-bold text-md">ロゴ</h2>
        <p>
          {"当サービスのロゴをご利用の方は"}
          <Link to="https://www.aipictors.com/presskit/">こちら</Link>
          {"をご参照ください"}
        </p>
      </div>
    </AppPage>
  )
}
