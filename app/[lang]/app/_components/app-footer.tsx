"use client"

import { cn } from "@/_lib/utils"
import Link from "next/link"

export const AppFooter = () => {
  return (
    <footer className={cn("container max-w-none", "space-y-2 border-t py-4")}>
      <div className="flex flex-col md:flex-row">
        <div className="flex space-x-4">
          <Link href={"/app/terms"} className="text-sm">
            {"利用規約"}
          </Link>
          <Link href={"/app/privacy"} className="text-sm">
            {"プライバシーポリシー"}
          </Link>
        </div>
        {/* <div className="flex space-x-4">
      <p className="text-sm">{"運営会社"}</p>
      <p className="text-sm">{"特定商取引法に基づく表記"}</p>
    </div> */}
      </div>
      <p className="text-sm">
        {
          "Aipictorsアプリは、AIイラスト・AIフォト・AI小説を投稿できるSNSアプリです。"
        }
      </p>
      <div className="flex">
        <p className="font-bold text-sm">{"© 2023 Aipictors"}</p>
      </div>
    </footer>
  )
}
