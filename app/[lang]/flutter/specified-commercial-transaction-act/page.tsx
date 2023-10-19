import { MainFlutterScta } from "app/[lang]/flutter/specified-commercial-transaction-act/_components/MainFlutterScta"
import type { Metadata } from "next"

const FlutterSctaPage = async () => {
  return <MainFlutterScta />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "特定商取引法に基づく表記" },
}

export const revalidate = 240

export default FlutterSctaPage
