export const useUpdateQueryParams = () => {
  const updateQueryParams = (newParams: URLSearchParams) => {
    const query = newParams.toString()
    const newUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname
    window.history.replaceState(null, "", newUrl)
  }
  return updateQueryParams
}
