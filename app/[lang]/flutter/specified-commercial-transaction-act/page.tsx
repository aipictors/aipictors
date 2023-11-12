import { FlutterSctaArticle } from "app/[lang]/flutter/specified-commercial-transaction-act/_components/flutter-scta-article"
import type { Metadata } from "next"

const FlutterSctaPage = async () => {
  return <FlutterSctaArticle />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "特定商取引法に基づく表記" },
}

export const revalidate = 240

export default FlutterSctaPage
