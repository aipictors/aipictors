export function TypingIndicator () {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="flex max-w-xs items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
        <div className="text-gray-600 text-sm dark:text-gray-400">AI返答中</div>
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  )
}
