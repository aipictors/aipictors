#!/usr/bin/env python3
"""
作品のタイトル・説明の検索用データベース（Cloudflare D1: aipictors-search）を MySQL と同期する。
aipic サーバーの cron で動かす（Python 3.6 / 標準ライブラリだけで動くようにしている）。

  sync_works.py recent   … 直近 40 分に編集・公開された作品（10 分ごと）
  sync_works.py days 30  … 直近 30 日に投稿された作品（いいね数の更新。1 日 1 回）

公開中（viewMode=0・削除されていない・公開日時を過ぎた）の作品は追加・更新し、それ以外は削除する。
設定: /root/.config/aipictors-search.env（CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, D1_DATABASE_ID）
MySQL の接続先は aipictors-system-altus コンテナの DATABASE_URL から読む。
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

ENV_FILE = "/root/.config/aipictors-search.env"


def load_env():
    env = {}
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"')
    return env


def mysql_rows(where_sql):
    url = subprocess.check_output(
        ["docker", "exec", "aipictors-system-altus", "printenv", "DATABASE_URL"]
    ).decode().strip()
    m = re.match(r"mysql://([^:]+):([^@]+)@([^/:]+)(?::(\d+))?/([^?]+)", url)
    user, password, _host, port, db = m.groups()

    def clean(col):
        return "REPLACE(REPLACE(REPLACE({}, CHAR(9), ' '), CHAR(10), ' '), CHAR(13), ' ')".format(col)

    sql = (
        "SELECT id, {}, {}, {}, ageLimit, favorite, UNIX_TIMESTAMP(time), "
        "(is_deleted = 0 AND viewMode = 0 AND IFNULL(adminViewMode, 0) = 0 AND time <= NOW()) AS visible "
        "FROM works WHERE {}"
    ).format(
        clean("title"),
        clean("IFNULL(enTitle, '')"),
        clean("LEFT(IFNULL(explanation, ''), 300)"),
        where_sql,
    )
    out = subprocess.check_output(
        ["mysql", "-h127.0.0.1", "-P", port or "3306", "-u" + user, "-p" + password, db,
         "-B", "--raw", "--skip-column-names", "-e", sql],
        stderr=subprocess.DEVNULL,
    ).decode("utf-8", "replace")
    rows = []
    for line in out.split("\n"):
        p = line.split("\t")
        if len(p) != 8:
            continue
        rows.append(p)
    return rows


def q(s):
    return "'" + s.replace("\x00", "").replace("'", "''") + "'"


def to_statements(rows, text_update=True):
    stmts = []
    upserts = []
    deletes = []
    for p in rows:
        wid = int(p[0])
        if p[7] == "1":
            title = p[1].strip()[:200]
            en = "" if p[2] == "NULL" else p[2].strip()[:200]
            desc = "" if p[3] == "NULL" else p[3].strip()
            ts = int(float(p[6])) if p[6] not in ("", "NULL") else 0
            upserts.append("({},{},{},{},{},{},{})".format(
                wid, q(title), q(en), q(desc), int(p[4]), int(p[5]), ts))
        else:
            deletes.append(str(wid))
    for i in range(0, len(upserts), 50):
        stmts.append(
            "INSERT INTO works(id,title,en_title,description,rating,likes,created_at) VALUES "
            + ",".join(upserts[i:i + 50])
            + (" ON CONFLICT(id) DO UPDATE SET title=excluded.title, en_title=excluded.en_title,"
               " description=excluded.description, rating=excluded.rating, likes=excluded.likes,"
               " created_at=excluded.created_at"
               if text_update
               # いいね数だけの更新では全文検索の索引を作り直さない（トリガーは文字の列の更新でだけ動く）
               else " ON CONFLICT(id) DO UPDATE SET rating=excluded.rating, likes=excluded.likes")
        )
    for i in range(0, len(deletes), 200):
        stmts.append("DELETE FROM works WHERE id IN ({})".format(",".join(deletes[i:i + 200])))
    return stmts, len(upserts), len(deletes)


def d1_query(env, sql):
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/accounts/{}/d1/database/{}/query".format(
            env["CLOUDFLARE_ACCOUNT_ID"], env["D1_DATABASE_ID"]),
        data=json.dumps({"sql": sql}).encode(),
        headers={"Authorization": "Bearer " + env["CLOUDFLARE_API_TOKEN"],
                 "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        body = json.loads(r.read().decode())
    if not body.get("success"):
        raise RuntimeError(json.dumps(body.get("errors"))[:500])


def main():
    env = load_env()
    mode = sys.argv[1] if len(sys.argv) > 1 else "recent"
    if mode == "days":
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
        where = "time >= NOW() - INTERVAL {} DAY".format(days)
    else:
        # updated_at は閲覧・いいねのたびに変わるので使わない（編集日時の updateTime と公開日時で見る）
        where = ("updateTime >= NOW() - INTERVAL 40 MINUTE "
                 "OR (time >= NOW() - INTERVAL 40 MINUTE AND time <= NOW())")
    rows = mysql_rows(where)
    stmts, n_up, n_del = to_statements(rows, text_update=(mode != "days"))
    # 1 回のリクエストは小さめにまとめる
    for i in range(0, len(stmts), 10):
        d1_query(env, ";\n".join(stmts[i:i + 10]))
    print("synced mode={} rows={} upserts={} deletes={}".format(mode, len(rows), n_up, n_del))


if __name__ == "__main__":
    main()
