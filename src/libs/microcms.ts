import { createClient } from "microcms-js-sdk";
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSListContent,
} from "microcms-js-sdk";

/* =========================
   client
========================= */

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: import.meta.env.MICROCMS_API_KEY || "",
});

/* =========================
   お知らせ
========================= */

export type Notice = {
  title?: string;
  content?: string;
  isImportant?: boolean;
} & MicroCMSListContent;

// ★ microCMS 側のエンドポイント名と完全一致させる
const NOTICE_ENDPOINT = "news";

export const getNoticeList = async (queries?: MicroCMSQueries) => {
  return client.getList<Notice>({
    endpoint: NOTICE_ENDPOINT,
    queries: {
      orders: "-publishedAt",
      ...queries,
    },
  });
};

export const getNoticeDetail = async (contentId: string, queries?: MicroCMSQueries) => {
  return client.getListDetail<Notice>({
    endpoint: NOTICE_ENDPOINT,
    contentId,
    queries,
  });
};

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

/* =========================
   ヘルプ記事（docs）
========================= */

export type Blog = {
  title: string;
  description?: string;
  content: string;
  thumbnail?: MicroCMSImage;
  category?: Category[];
} & MicroCMSListContent;

export type Category = {
  name: string;
} & MicroCMSListContent;

export const getBlogList = async (queries?: MicroCMSQueries) => {
  return client.getList<Blog>({
    endpoint: "docs",
    queries,
  });
};

export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return client.getListDetail<Blog>({
    endpoint: "docs",
    contentId,
    queries,
  });
};

export const getCategoryList = async (queries?: MicroCMSQueries) => {
  return client.getList<Category>({
    endpoint: "categories",
    queries,
  });
};

/* =========================
   Settings
========================= */

export interface Settings {
  title: string;
  description: string;
  about: string;
}

const DEFAULT_SETTINGS: Settings = {
  title: "Set Your Title Here",
  description: "Set Your Description Here",
  about: "Set Your Text Here",
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await client.get({ endpoint: "settings" });
    return data as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};
