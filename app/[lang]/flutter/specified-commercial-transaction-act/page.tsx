import type { Metadata } from "next"

const FlutterSctaPage = async () => {
  return (
    <div className="py-8">
      <div className="flex justify-between">
        <p>{"運営サービス"}</p>
        <p>{"Aipictors"}</p>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "特定商取引法に基づく表記" },
}

export default FlutterSctaPage
