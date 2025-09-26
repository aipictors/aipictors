import { useState, useEffect } from "react"

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
}

/**
 * IPアドレス情報を取得するhook
 */
export function useIpAddress() {
  const [ipInfo, setIpInfo] = useState<IpAddressInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIpInfo = async () => {
    if (isLoading) return // 重複実行を防ぐ

    setIsLoading(true)
    setError(null)

    try {
      // ipapi.co API を使用してIPアドレス情報を取得
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
      }

      setIpInfo(info)
    } catch (err) {
      setError(
        "IPアドレス情報の取得に失敗しました。ネットワーク接続を確認してください。",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 初回マウント時に自動取得
  useEffect(() => {
    fetchIpInfo()
  }, [])

  return {
    ipInfo,
    isLoading,
    error,
    refetch: fetchIpInfo,
  }
}
