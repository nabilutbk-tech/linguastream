import { createClient } from "@libsql/client";

const url = "libsql://linguastream-db-ghibran7447.aws-ap-southeast-2.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEzNzMxNTgsImlkIjoiMDFhMTE2MjgtZjIwMS03YTBiLWEwYzYtZjdmODk1YzkwYmJhIiwia2lkIjoibWR2MVdUc3dJVzNmaEVmaWhRRkxhYmkzMWRxSzNINUh3ZXB4cGlnbjMzSSIsInJpZCI6IjhhMWJiMmZlLTk4MmItNDMxMi05MDIyLThkMjI4MDIxYzM3MSJ9.ZiYO7-6g-huDVFq2hm3-yr85XmU3FwTvLgOXad426jXijl3j7JGDtz70MDY7APLUTtxB40KGYd1SKpnPrA6mAw";

const client = createClient({ url, authToken });

const sql = `
CREATE TABLE IF NOT EXISTS "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'telegram',
    "telegramFileId" TEXT,
    "telegramChatId" TEXT,
    "telegramMessageId" INTEGER,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Subtitle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'file',
    "fileUrl" TEXT,
    "telegramFileId" TEXT,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'srt',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT,
    "word" TEXT NOT NULL,
    "reading" TEXT,
    "meaning" TEXT NOT NULL,
    "context" TEXT,
    "language" TEXT NOT NULL,
    "tags" TEXT,
    "notes" TEXT,
    "mastered" BOOLEAN NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "QuizResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT,
    "quizType" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

async function main() {
  console.log("Creating tables on Turso Cloud...");
  await client.executeMultiple(sql);
  console.log("🚀 SUCCESS: All tables created on Turso Cloud!");
}

main().catch(console.error);