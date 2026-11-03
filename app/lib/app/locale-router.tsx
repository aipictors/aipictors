import {
  Link as RemixLink,
  NavLink as RemixNavLink,
  useLocation,
  useNavigate as useRemixNavigate,
  type LinkProps,
  type NavLinkProps,
} from "@remix-run/react"
import { forwardRef, useCallback } from "react"
import type { NavigateOptions, To } from "react-router-dom"
import {
  buildLocalePath,
  getPathLocale,
  type SupportedLocale,
} from "~/utils/locale-path"

/** ($lang) のルートがないパス（英語の URL にできない） */
const NON_LOCALE_PATH = /^\/(?:api(?:\/|$)|sitemaps\/|sitemap\.xml|events\/wakiaiai|__)/

/**
 * サイト内のリンク先を今の言語の URL にする。
 * 英語のページのリンクが日本語の URL のままだと、移動で日本語に戻り、検索エンジンも英語のページをたどれない
 */
export const toLocalePathname = (
  locale: SupportedLocale,
  pathname: string,
): string => {
  if (locale !== "en" || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return pathname
  }
  if (NON_LOCALE_PATH.test(pathname) || /\.[a-z0-9]{2,5}$/i.test(pathname)) {
    return pathname
  }
  return buildLocalePath("en", pathname)
}

export const toLocaleTo = (locale: SupportedLocale, to: To): To => {
  if (typeof to === "string") {
    const match = to.match(/^([^?#]*)(.*)$/s)
    return `${toLocalePathname(locale, match?.[1] ?? to)}${match?.[2] ?? ""}`
  }
  return to.pathname
    ? { ...to, pathname: toLocalePathname(locale, to.pathname) }
    : to
}

/**
 * 今の言語を保つ Link
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { pathname } = useLocation()
  return (
    <RemixLink
      {...props}
      ref={ref}
      to={toLocaleTo(getPathLocale(pathname), props.to)}
    />
  )
})
Link.displayName = "Link"

/**
 * 今の言語を保つ NavLink
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    const { pathname } = useLocation()
    return (
      <RemixNavLink
        {...props}
        ref={ref}
        to={toLocaleTo(getPathLocale(pathname), props.to)}
      />
    )
  },
)
NavLink.displayName = "NavLink"

/**
 * 今の言語を保つ useNavigate（言語を切り替えるときは @remix-run/react のものを使う）
 */
export function useNavigate() {
  const navigate = useRemixNavigate()
  const { pathname } = useLocation()
  const locale = getPathLocale(pathname)

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        navigate(to)
        return
      }
      navigate(toLocaleTo(locale, to), options)
    },
    [navigate, locale],
  )
}
