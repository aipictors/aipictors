/**
 * プロフィールのリンクの表示名（R18 のプロフィールのリンク）
 * よく使われる支援・販売サイトはサービス名、それ以外はドメインを出す
 */
const SERVICES: Array<{ name: string; hosts: string[] }> = [
  { name: "FANZA", hosts: ["dmm.co.jp", "fanza.co.jp", "dlsoft.dmm.co.jp"] },
  { name: "Fantia", hosts: ["fantia.jp"] },
  { name: "FANBOX", hosts: ["fanbox.cc"] },
  { name: "Ci-en", hosts: ["ci-en.net", "ci-en.dlsite.com"] },
  { name: "DLsite", hosts: ["dlsite.com"] },
  { name: "Skeb", hosts: ["skeb.jp"] },
  { name: "Patreon", hosts: ["patreon.com"] },
  { name: "pixiv", hosts: ["pixiv.net"] },
  { name: "BOOTH", hosts: ["booth.pm"] },
  { name: "メロンブックス", hosts: ["melonbooks.co.jp"] },
  { name: "とらのあな", hosts: ["toranoana.jp"] },
  { name: "X", hosts: ["x.com", "twitter.com"] },
]

const matchesHost = (hostname: string, host: string) =>
  hostname === host || hostname.endsWith(`.${host}`)

export const toProfileLinkServiceName = (url: string): string => {
  let hostname: string
  try {
    hostname = new URL(url).hostname.toLowerCase()
  } catch {
    return url
  }
  // FANBOX はクリエイターごとのサブドメイン（xxx.fanbox.cc）、ci-en は ci-en.dlsite.com もある
  const service = SERVICES.find((item) =>
    item.hosts.some((host) => matchesHost(hostname, host)),
  )
  if (service) return service.name
  return hostname.replace(/^www\./, "")
}
