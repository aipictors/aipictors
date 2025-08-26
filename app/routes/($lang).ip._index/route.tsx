import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { Alert, AlertDescription } from "~/components/ui/alert"
import {
  Globe,
  MapPin,
  Server,
  Monitor,
  RefreshCw,
  Copy,
  WifiIcon,
  ShieldCheck,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { config } from "~/config"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { useState, useEffect } from "react"
import { toast } from "sonner"

type IpAddressInfo = {
  ip: string
  hostname?: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
  timezone?: string
  isp?: string
  org?: string
  latitude?: number
  longitude?: number
  userAgent?: string
}

/**
 * IPアドレス情報表示ページ
 */
export default function Route() {
  const t = useTranslation()
  const [ipInfo, setIpInfo] = useState<IpAddressInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIpInfo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // ipify API を使用してIPアドレス情報を取得
      const response = await fetch("https://ipapi.co/json/")
      if (!response.ok) {
        throw new Error("Failed to fetch IP information")
      }

      const data = await response.json()

      const info: IpAddressInfo = {
        ip: data.ip,
        hostname: data.hostname,
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        timezone: data.timezone,
        isp: data.org,
        org: data.org,
        latitude: data.latitude,
        longitude: data.longitude,
        userAgent: navigator.userAgent,
      }

      setIpInfo(info)
    } catch (err) {
      setError(
        t(
          "IPアドレス情報の取得に失敗しました。ネットワーク接続を確認してください。",
          "Failed to fetch IP address information. Please check your network connection.",
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIpInfo()
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(t("クリップボードにコピーしました", "Copied to clipboard"))
    } catch {
      toast(t("コピーに失敗しました", "Failed to copy"))
    }
  }

  if (error) {
    return (
      <div className="container-shadcn-ui max-w-4xl space-y-8 px-8 py-8">
        <div className="space-y-4">
          <h1 className="font-bold text-3xl">
            {t("IPアドレス情報", "IP Address Information")}
          </h1>
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchIpInfo} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("再試行", "Retry")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-shadcn-ui max-w-4xl space-y-8 px-8 py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-3xl">
            {t("IPアドレス情報", "IP Address Information")}
          </h1>
          <Button
            onClick={fetchIpInfo}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("更新", "Refresh")}
          </Button>
        </div>

        <p className="text-muted-foreground">
          {t(
            "現在アクセスしている端末のIPアドレスや地理的情報を表示します。",
            "Shows the IP address and geographic information of the currently accessing device.",
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t("基本情報", "Basic Information")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {t("IPアドレス", "IP Address")}
                </span>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{ipInfo?.ip}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => ipInfo?.ip && copyToClipboard(ipInfo.ip)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {ipInfo?.hostname && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {t("ホスト名", "Hostname")}
                  </span>
                  <Badge variant="outline">{ipInfo.hostname}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 地理的情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("地理的情報", "Geographic Information")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                {ipInfo?.country && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("国", "Country")}</span>
                    <div className="flex items-center gap-2">
                      <Badge>{ipInfo.country}</Badge>
                      {ipInfo.countryCode && (
                        <Badge variant="outline">{ipInfo.countryCode}</Badge>
                      )}
                    </div>
                  </div>
                )}

                {ipInfo?.region && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("地域", "Region")}</span>
                    <Badge variant="outline">{ipInfo.region}</Badge>
                  </div>
                )}

                {ipInfo?.city && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("都市", "City")}</span>
                    <Badge variant="outline">{ipInfo.city}</Badge>
                  </div>
                )}

                {ipInfo?.timezone && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t("タイムゾーン", "Timezone")}
                    </span>
                    <Badge variant="outline">{ipInfo.timezone}</Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ネットワーク情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiIcon className="h-5 w-5" />
              {t("ネットワーク情報", "Network Information")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2">
                {ipInfo?.isp && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t("プロバイダー", "ISP")}
                    </span>
                    <Badge variant="outline">{ipInfo.isp}</Badge>
                  </div>
                )}

                {ipInfo?.org && ipInfo.org !== ipInfo.isp && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t("組織", "Organization")}
                    </span>
                    <Badge variant="outline">{ipInfo.org}</Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* デバイス情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {t("デバイス情報", "Device Information")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-medium">
                    {t("ユーザーエージェント", "User Agent")}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        ipInfo?.userAgent && copyToClipboard(ipInfo.userAgent)
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground break-all">
                  {ipInfo?.userAgent}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            {t("プライバシーについて", "About Privacy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t(
              "この情報は外部のIPアドレス情報提供サービスから取得されています。個人を特定する情報は含まれておらず、この画面以外に保存されることはありません。",
              "This information is obtained from external IP address information services. It does not contain personally identifiable information and is not stored outside of this screen.",
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "IPアドレス情報",
      enTitle: "IP Address Information",
      description: "現在アクセスしている端末のIPアドレス情報を表示します。",
      enDescription:
        "Shows the IP address information of the currently accessing device.",
      isIndex: false, // no index指定
    },
    undefined,
    props.params.lang,
  )
}
