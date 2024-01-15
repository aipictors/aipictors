const RootLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin h-12 w-12 rounded-full border-t-2 dark:border-gray-50" />
      <p className="mt-4 text-xl">Loading...</p>
    </div>
  )
}

export default RootLoading
