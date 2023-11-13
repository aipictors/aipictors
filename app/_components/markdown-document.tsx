import { cn } from "@/lib/utils"
import ReactMarkdown, { Components } from "react-markdown"

type Props = {
  children: React.ReactNode
}

export const MarkdownDocument: React.FC<Props> = (props) => {
  if (typeof props.children !== "string") {
    return <>{props.children}</>
  }

  const components: Components = {
    li(props) {
      return (
        <li className="text-base leading-7 ml-4 mt-0.5 md:ml-6">
          {props.children}
        </li>
      )
    },
    ul(props) {
      return (
        <ul className="list-disc ml-0 mt-2 mr-auto text-base">
          {props.children}
        </ul>
      )
    },
    ol(props) {
      return (
        <ol className="list-decimal ml-0 mt-2 mr-auto text-base">
          {props.children}
        </ol>
      )
    },
    h1(props) {
      return (
        <h1
          className={cn(
            "font-bold text-2xl mb-4 md:text-3xl",
            props.node?.position?.start.line !== 1 && "mt-8",
          )}
        >
          {props.children}
        </h1>
      )
    },
    h2(props) {
      return (
        <h2
          className={cn(
            "font-bold text-xl mb-2 md:text-2xl",
            props.node?.position?.start.line !== 1 && "mt-6",
          )}
        >
          {props.children}
        </h2>
      )
    },
    h3(props) {
      return (
        <p
          className={cn(
            "whitespace-pre-wrap font-bold text-lg b-1 md:text-xl",
            props.node?.position?.start.line !== 1 && "mt-6",
          )}
        >
          {props.children}
        </p>
      )
    },
    p(props) {
      if (typeof props.children === "string") {
        return (
          <p
            className={cn(
              "leading-relaxed whitespace-pre-wrap text-base",
              props.node?.position?.start.line !== 1 && "mt-2",
            )}
          >
            {props.children}
          </p>
        )
      }
      return <>{props.children}</>
    },
    a(props) {
      return (
        <a
          href={props.href ?? ""}
          className="text-blue-500 no-underline font-bold break-all text-base"
          rel="noreferrer"
          target="_blank"
        >
          {props.children}
        </a>
      )
    },
    img(props) {
      return (
        // biome-ignore lint/a11y/useAltText: <explanation>
        <img
          alt={props.alt}
          className="mx-auto w-full rounded-lg my-4"
          {...props}
        />
      )
    },
    strong(props) {
      return <strong className="text-pink-500" {...props} />
    },
    blockquote(props) {
      return (
        <blockquote className="mt-4">
          <div className="border-l-8 pl-4 pb-4">{props.children}</div>
        </blockquote>
      )
    },
    pre(props) {
      return (
        <pre className="my-4 p-4 overflow-auto bg-gray-100 rounded">
          {props.children}
        </pre>
      )
    },
  }

  return (
    <div>
      <ReactMarkdown components={components}>{props.children}</ReactMarkdown>
    </div>
  )
}
