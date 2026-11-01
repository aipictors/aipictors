#!/usr/bin/env bash
# 生成画面のお知らせ（メンテナンス中・不安定・変更直後）を出す／消す／見る
#
#   scripts/generation-notice.sh show
#   scripts/generation-notice.sh set <maintenance|unstable|changed> [時間(h)] [本文] [リンク URL]
#   scripts/generation-notice.sh off
#
# 例: scripts/generation-notice.sh set unstable 3
#     → 3 時間「アップデート中」を出す（本文省略時はサイト側の既定の文言）
#
# KV（PAGE_CACHE）の generation-notice に JSON を置く。サイトには 1 分ほどで反映される。
# 要: CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN（~/.config/aipictors/cloudflare.env）
set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -f ~/.config/aipictors/cloudflare.env ]]; then
  set -a
  # shellcheck disable=SC1090
  . ~/.config/aipictors/cloudflare.env
  set +a
fi

NAMESPACE_ID="8d789ec6fbe94540a435a7936fa2e4bb"
KEY="generation-notice"
URL="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

case "${1:-show}" in
  show)
    curl -s "$URL" -H "$AUTH"
    echo
    ;;
  set)
    kind="${2:?kind: maintenance | unstable | changed}"
    hours="${3:-}"
    message="${4:-}"
    link="${5:-}"
    body=$(KIND="$kind" HOURS="$hours" MESSAGE="$message" LINK="$link" python3 -c '
import json, os, datetime
now = datetime.datetime.now(datetime.timezone.utc)
notice = {"id": now.strftime("%Y%m%d%H%M%S"), "kind": os.environ["KIND"], "startsAt": now.isoformat()}
if os.environ["HOURS"]:
    notice["endsAt"] = (now + datetime.timedelta(hours=float(os.environ["HOURS"]))).isoformat()
if os.environ["MESSAGE"]:
    notice["message"] = os.environ["MESSAGE"]
if os.environ["LINK"]:
    notice["linkUrl"] = os.environ["LINK"]
print(json.dumps(notice, ensure_ascii=False))
')
    curl -s -X PUT "$URL" -H "$AUTH" -H "content-type: text/plain; charset=utf-8" --data-binary "$body" >/dev/null
    echo "$body"
    ;;
  off)
    curl -s -X DELETE "$URL" -H "$AUTH" >/dev/null
    echo "off"
    ;;
  *)
    echo "usage: $0 show | set <kind> [hours] [message] [link] | off" >&2
    exit 1
    ;;
esac
