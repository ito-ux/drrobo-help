import type {
  MicroCMSQueries,
  MicroCMSListContent,
  MicroCMSImage,
  MicroCMSListResponse
} from "microcms-js-sdk";
import { createClient } from "microcms-js-sdk";

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: import.meta.env.MICROCMS_API_KEY || "",
});

// お知らせの型（必要に応じて増やせる）
export type Notice = {
  id: string;
  title?: string;
  content?: string;

  // 重要帯にしたいなら microCMS に boolean フィールド作ってこれを使う
  isImportant?: boolean;

  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ★ エンドポイント名は要確認（例: "notices"）
const NOTICE_ENDPOINT = "notices";

export const getNoticeList = async (queries?: MicroCMSQueries) => {
  return client.getList<Notice>({
    endpoint: NOTICE_ENDPOINT,
    queries: {
      orders: "-publishedAt", // 新しい順（運用に合わせて変えてOK）
      ...queries,
    },
  });
};

// 重要なお知らせ（帯用）：最大1件だけ取る例
export const getImportantNotice = async () => {
  const res = await client.getList<Notice>({
    endpoint: NOTICE_ENDPOINT,
    queries: {
      filters: "isImportant[equals]true",
      orders: "-publishedAt",
      limit: 1,
    },
  });
  return res.contents?.[0] ?? null;
};

export type Blog = {
  title: string;
  description: string;
  content: string;
  category?: Category; // ← Category[] じゃなくて Category
  tags?: Category[];   // tags を使ってるなら別で型を用意した方がよい（例）
  thumbnail: MicroCMSImage;
} & MicroCMSListContent;


export type Category = {
  name: string;
} & MicroCMSListContent;

export interface Settings {
  title: string;
  description: string;
  about: string;
}

export type Notice = {
  title?: string;
  content?: string;
  isImportant?: boolean;
} & MicroCMSListContent;


const DEFAULT_SETTINGS: Settings = {
  title: "Set Your Title Here",
  description: "Set Your Description Here",
  about: "Set Your Text Here",
};

export const getBlogList = async (queries?: MicroCMSQueries) => {
  return await client.getList<Blog>({ endpoint: "docs", queries });
};

export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Blog>({
    endpoint: "docs",
    contentId,
    queries,
  });
};

export const getCategoryList = async (queries?: MicroCMSQueries) => {
  return client.getList<Category>({ endpoint: "categories", queries });
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await client.get({ endpoint: "settings" });
    return data as Settings;
  } catch (error: any) {
    return DEFAULT_SETTINGS;
  }
};
