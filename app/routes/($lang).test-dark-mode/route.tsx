import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"

export default function TestDarkMode () {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="font-bold text-2xl">ダークモードテスト</h1>

        <div className="space-y-4">
          <p>現在のテーマ: {theme}</p>
          <div className="space-x-4">
            <Button onClick={() => setTheme("light")}>ライトモード</Button>
            <Button onClick={() => setTheme("dark")}>ダークモード</Button>
            <Button onClick={() => setTheme("system")}>システム</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-xl">ダークモードテスト要素</h2>

          {/* 基本的なdark:クラスのテスト */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-900 dark:text-gray-100">
              このテキストはライトモードでは黒、ダークモードでは白になります
            </p>
          </div>

          {/* 背景色のテスト */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-gray-900 dark:text-gray-100">Gray 100/800</p>
            </div>
            <div className="rounded bg-blue-100 p-4 dark:bg-blue-800">
              <p className="text-blue-900 dark:text-blue-100">Blue 100/800</p>
            </div>
            <div className="rounded bg-green-100 p-4 dark:bg-green-800">
              <p className="text-green-900 dark:text-green-100">
                Green 100/800
              </p>
            </div>
          </div>

          {/* CSSカスタムプロパティのテスト */}
          <div className="rounded-lg border border-border bg-background p-4 text-foreground">
            <p>CSSカスタムプロパティ: background, foreground, border</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
            <p>カードの背景色とテキスト色</p>
          </div>

          <div className="rounded-lg bg-muted p-4 text-muted-foreground">
            <p>ミュートされた背景色とテキスト色</p>
          </div>
        </div>

        {/* data-theme属性の確認 */}
        <div className="space-y-2">
          <h3 className="font-medium text-lg">デバッグ情報</h3>
          <p>HTML要素のdata-theme属性を確認:</p>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
            {typeof window !== "undefined"
              ? `document.documentElement.getAttribute('data-theme'): ${document.documentElement.getAttribute("data-theme")}`
              : "サーバーサイドレンダリング中"}
          </pre>

          {/* Tailwind darkMode設定のテスト */}
          <div className="space-y-4">
            <h4 className="font-medium">Tailwind dark:クラステスト</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded bg-red-100 p-3 dark:bg-red-900">
                <p className="text-red-900 dark:text-red-100">Red</p>
              </div>
              <div className="rounded bg-yellow-100 p-3 dark:bg-yellow-900">
                <p className="text-yellow-900 dark:text-yellow-100">Yellow</p>
              </div>
              <div className="rounded bg-purple-100 p-3 dark:bg-purple-900">
                <p className="text-purple-900 dark:text-purple-100">Purple</p>
              </div>
              <div className="rounded bg-pink-100 p-3 dark:bg-pink-900">
                <p className="text-pink-900 dark:text-pink-100">Pink</p>
              </div>
            </div>
          </div>

          {/* すべてのダークテーマバリエーションをテスト */}
          <div className="space-y-2">
            <h4 className="font-medium">利用可能なテーマ</h4>
            <div className="grid grid-cols-4 gap-2">
              <Button size="sm" onClick={() => setTheme("dark")}>
                dark
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-gray")}>
                dark-gray
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-blue")}>
                dark-blue
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-red")}>
                dark-red
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-green")}>
                dark-green
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-orange")}>
                dark-orange
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-pink")}>
                dark-pink
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-violet")}>
                dark-violet
              </Button>
              <Button size="sm" onClick={() => setTheme("dark-yellow")}>
                dark-yellow
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
