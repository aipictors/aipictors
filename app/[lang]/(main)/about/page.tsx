import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"
import Link from "next/link"

/**
 * サイトについて
 * @returns
 */
const AboutPage = async () => {
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
        <Link href="/contact">こちら</Link>
        <h2 className="py-2 font-bold text-md">プライバシーポリシー</h2>
        <Link href="/privacy">個人情報の利用目的などについて</Link>
        <h2 className="py-2 font-bold text-md">利用規約</h2>
        <p>
          {"サービスのご利用にあたっては"}
          <Link href="/terms">こちら</Link>
          {"をご参照ください"}
        </p>
        <h2 className="py-2 font-bold text-md">ガイドライン</h2>
        <p>
          {"機能の使い方は"}
          <Link href="/guideline">こちら</Link>
          {"をご参照ください"}
        </p>
        <h2 className="py-2 font-bold text-md">ロゴ</h2>
        <p>
          {"当サービスのロゴをご利用の方は"}
          <Link href="https://www.aipictors.com/presskit/">こちら</Link>
          {"をご参照ください"}
        </p>
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "本サイトについて",
}

export default AboutPage
