import type { Metadata } from "next"

const FlutterSctaPage = async () => {
  return (
    <div className="flex justify-center py-8">
      <div className="max-w-container-sm mx-auto w-full px-4 md:px-12 min-h-screen">
        <div className="flex justify-between">
          <p>{"運営サービス"}</p>
          <p>{"Aipictors"}</p>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "特定商取引法に基づく表記" },
}

export const revalidate = 240

export default FlutterSctaPage
