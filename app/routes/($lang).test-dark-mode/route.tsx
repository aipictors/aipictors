import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"

export default function TestDarkMode() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">ダークモードテスト</h1>

        <div className="space-y-4">
          <p>現在のテーマ: {theme}</p>
          <div className="space-x-4">
            <Button onClick={() => setTheme("light")}>ライトモード</Button>
            <Button onClick={() => setTheme("dark")}>ダークモード</Button>
            <Button onClick={() => setTheme("system")}>システム</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">ダークモードテスト要素</h2>

          {/* 基本的なdark:クラスのテスト */}
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-900 dark:text-gray-100">
              このテキストはライトモードでは黒、ダークモードでは白になります
            </p>
          </div>

          {/* 背景色のテスト */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-900 dark:text-gray-100">Gray 100/800</p>
            </div>
            <div className="p-4 bg-blue-100 dark:bg-blue-800 rounded">
              <p className="text-blue-900 dark:text-blue-100">Blue 100/800</p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-800 rounded">
              <p className="text-green-900 dark:text-green-100">
                Green 100/800
              </p>
            </div>
          </div>

          {/* CSSカスタムプロパティのテスト */}
          <div className="p-4 rounded-lg bg-background text-foreground border border-border">
            <p>CSSカスタムプロパティ: background, foreground, border</p>
          </div>

          <div className="p-4 rounded-lg bg-card text-card-foreground border border-border">
            <p>カードの背景色とテキスト色</p>
          </div>

          <div className="p-4 rounded-lg bg-muted text-muted-foreground">
            <p>ミュートされた背景色とテキスト色</p>
          </div>
        </div>

        {/* data-theme属性の確認 */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">デバッグ情報</h3>
          <p>HTML要素のdata-theme属性を確認:</p>
          <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-auto">
            {typeof window !== "undefined"
              ? `document.documentElement.getAttribute('data-theme'): ${document.documentElement.getAttribute("data-theme")}`
              : "サーバーサイドレンダリング中"}
          </pre>

          {/* Tailwind darkMode設定のテスト */}
          <div className="space-y-4">
            <h4 className="font-medium">Tailwind dark:クラステスト</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded">
                <p className="text-red-900 dark:text-red-100">Red</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded">
                <p className="text-yellow-900 dark:text-yellow-100">Yellow</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded">
                <p className="text-purple-900 dark:text-purple-100">Purple</p>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded">
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
