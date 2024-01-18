export default function RootLoading() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <div className="animate-spin h-12 w-12 rounded-full border-t-4" />
      <p className="text-xl">Loading...</p>
    </div>
  )
}
