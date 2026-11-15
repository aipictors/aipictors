import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { buildSchema, validate } from "graphql"
import { panelNotificationsQuery } from "./home-notifications-panel-queries"

const schema = buildSchema(readFileSync("schema.graphql", "utf8"))

test("通知の一覧の問い合わせがスキーマの検証を通る（種類ごとの同じ名前の項目の型が食い違うと全部読めなくなる）", () => {
  const errors = validate(schema, panelNotificationsQuery)
  expect(errors.map((error) => error.message)).toEqual([])
})
