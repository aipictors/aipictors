import { Button } from "~/components/ui/button"
import { useNavigate } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { Sparkles, Palette, Users, Star } from "lucide-react"

/**
 * 新しい設定完了ページ
 */
export function NewSettingsCompleted() {
  const navigate = useNavigate()
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* 完了メッセージ */}
      <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-8 text-center dark:border-green-600 dark:from-green-900/30 dark:to-blue-900/30">
        <div className="mb-6 text-6xl">🎉</div>
        <h1 className="mb-4 font-bold text-3xl text-gray-800 dark:text-gray-100">
          {t(
            "設定完了おめでとうございます！",
            "Congratulations! Setup Complete!",
          )}
        </h1>
        <p className="mb-2 text-gray-600 text-lg dark:text-gray-300">
          {t("Aipictorsへようこそ！", "Welcome to Aipictors!")}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          {t(
            "これであなたもAIクリエイターの仲間入りです",
            "You are now part of the AI creator community",
          )}
        </p>
      </div>

      {/* 次のステップ */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-center font-bold text-gray-800 text-xl dark:text-gray-100">
          {t("さあ、何から始めますか？", "What would you like to do first?")}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI生成 */}
          <button
            type="button"
            className="group cursor-pointer rounded-lg border border-purple-200 bg-purple-50 p-6 text-left transition-all hover:border-purple-300 hover:bg-purple-100 dark:border-purple-600 dark:bg-purple-900/30 dark:hover:border-purple-500 dark:hover:bg-purple-900/50"
            onClick={() => navigate("/generation")}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-purple-500 p-3">
                <Sparkles className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-gray-800 dark:text-gray-100">
                  {t("AI画像を生成してみる", "Try AI Image Generation")}
                </h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">
                  {t(
                    "無料でAI画像を生成できます。まずは簡単なプロンプトから始めてみましょう",
                    "Generate AI images for free. Start with simple prompts",
                  )}
                </p>
                <div className="mt-3">
                  <Button asChild className="group-hover:bg-purple-600">
                    <span>{t("生成を始める", "Start Generating")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </button>

          {/* 作品投稿 */}
          <button
            type="button"
            className="group cursor-pointer rounded-lg border border-blue-200 bg-blue-50 p-6 text-left transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/30 dark:hover:border-blue-500 dark:hover:bg-blue-900/50"
            onClick={() => navigate("/new/image")}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-500 p-3">
                <Palette className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-gray-800 dark:text-gray-100">
                  {t("作品を投稿してみる", "Try Posting Your Work")}
                </h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">
                  {t(
                    "あなたの作品を投稿して、たくさんの人に見てもらいましょう",
                    "Post your work and share it with many people",
                  )}
                </p>
                <div className="mt-3">
                  <Button asChild className="group-hover:bg-blue-600">
                    <span>{t("投稿する", "Post Work")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </button>

          {/* 作品を楽しむ */}
          <button
            type="button"
            className="group cursor-pointer rounded-lg border border-green-200 bg-green-50 p-6 text-left transition-all hover:border-green-300 hover:bg-green-100 dark:border-green-600 dark:bg-green-900/30 dark:hover:border-green-500 dark:hover:bg-green-900/50"
            onClick={() => navigate("/")}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-500 p-3">
                <Star className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-gray-800 dark:text-gray-100">
                  {t("みんなの作品を楽しむ", "Enjoy Everyone's Works")}
                </h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">
                  {t(
                    "素晴らしいAI作品がたくさん投稿されています。いいねやコメントで交流しましょう",
                    "Browse amazing AI works and interact with likes and comments",
                  )}
                </p>
                <div className="mt-3">
                  <Button asChild className="group-hover:bg-green-600">
                    <span>{t("作品を見る", "Browse Works")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </button>

          {/* コミュニティ */}
          <button
            type="button"
            className="group cursor-pointer rounded-lg border border-orange-200 bg-orange-50 p-6 text-left transition-all hover:border-orange-300 hover:bg-orange-100 dark:border-orange-600 dark:bg-orange-900/30 dark:hover:border-orange-500 dark:hover:bg-orange-900/50"
            onClick={() => navigate("/users")}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-orange-500 p-3">
                <Users className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-gray-800 dark:text-gray-100">
                  {t("クリエイターを探す", "Discover Creators")}
                </h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">
                  {t(
                    "お気に入りのクリエイターをフォローして、新しい作品をいち早くチェックしましょう",
                    "Follow your favorite creators and stay updated with their latest works",
                  )}
                </p>
                <div className="mt-3">
                  <Button asChild className="group-hover:bg-orange-600">
                    <span>{t("探してみる", "Explore")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ヒント */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-600 dark:bg-blue-900/30">
        <h3 className="mb-4 font-bold text-gray-800 dark:text-gray-100">
          {t("💡 はじめてのAipictors", "💡 Getting Started Tips")}
        </h3>
        <div className="space-y-3 text-gray-700 text-sm dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <p>
              {t(
                "設定はいつでも右上のメニューから変更できます",
                "You can change settings anytime from the menu in the top right",
              )}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <p>
              {t(
                "困った時は画面下部のヘルプやお問い合わせをご利用ください",
                "If you need help, check the help section or contact us at the bottom of the page",
              )}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <p>
              {t(
                "毎日新しい作品が投稿されるので、ぜひ定期的にチェックしてみてください",
                "New works are posted daily, so check back regularly for fresh content",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 設定変更ボタン */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => navigate("/settings")}
          className="text-gray-600 dark:text-gray-300"
        >
          {t("設定を変更する", "Change Settings")}
        </Button>
      </div>
    </div>
  )
}
