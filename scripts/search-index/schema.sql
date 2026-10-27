CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  en_title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS works_likes ON works(likes DESC);
CREATE INDEX IF NOT EXISTS works_created ON works(created_at DESC);
CREATE VIRTUAL TABLE IF NOT EXISTS works_fts USING fts5(
  title, en_title, description,
  content='works', content_rowid='id', tokenize='trigram'
);
CREATE TRIGGER IF NOT EXISTS works_ai AFTER INSERT ON works BEGIN
  INSERT INTO works_fts(rowid, title, en_title, description) VALUES (new.id, new.title, new.en_title, new.description);
END;
CREATE TRIGGER IF NOT EXISTS works_ad AFTER DELETE ON works BEGIN
  INSERT INTO works_fts(works_fts, rowid, title, en_title, description) VALUES ('delete', old.id, old.title, old.en_title, old.description);
END;
CREATE TRIGGER IF NOT EXISTS works_au AFTER UPDATE OF title, en_title, description ON works BEGIN
  INSERT INTO works_fts(works_fts, rowid, title, en_title, description) VALUES ('delete', old.id, old.title, old.en_title, old.description);
  INSERT INTO works_fts(rowid, title, en_title, description) VALUES (new.id, new.title, new.en_title, new.description);
END;
