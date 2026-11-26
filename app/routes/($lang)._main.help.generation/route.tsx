/**
 * /help/generation。/generation という別のページがあり、($lang)._main.help.$section だと lang=help の /generation に取られて 404 になるので静的に置く
 */
export {
  default,
  headers,
  loader,
  meta,
} from "~/routes/($lang)._main.help.$section/route"
