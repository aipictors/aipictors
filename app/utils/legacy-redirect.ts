/**
 * 旧サイトの URL を今のページへ移す先（なければ null）
 * X のプロフィールなどに貼られたままの旧 URL がトップページに飛ばされていたため
 * /user?id=3293・/user/?id=3293・/profile?id=3293 → /users/3293（/users は数字の ID でも開ける）
 */
export const getLegacyRedirectPath = (url: URL): string | null => {
  const pathname = url.pathname.replace(/\/+$/, "")
  if (pathname === "/user" || pathname === "/profile") {
    const id = url.searchParams.get("id")?.trim()
    if (id && /^[0-9A-Za-z_-]+$/.test(id)) {
      return `/users/${id}`
    }
  }
  return null
}
