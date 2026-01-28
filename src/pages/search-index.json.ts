import type { APIRoute } from "astro";
import { getBlogList } from "@libs/microcms.ts";
import { microCMSRichEditorHandler } from "microcms-rich-editor-handler";

export const prerender = true;

// h1〜h6 を中身ごと削除
function removeHeadings(html: string) {
  return html.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, " ");
}

// HTML -> テキスト（タグ除去 + 空白整形）
function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const GET: APIRoute = async () => {
  const LIMIT = 1000; // ←まずはここ。問題なければ 2000 に上げる
  const BODY_MAX = 1000; // ←本文は先頭1000文字だけ（重くしない）

  const { contents } = await getBlogList({ limit: LIMIT });

  const index = await Promise.all(
    contents.map(async (p) => {
      // 本文（プレーンテキスト化 + 見出し除外）
      let body = "";
      if (p?.content) {
        // ここでは重いtransformerは使わない（検索用なので整形不要）
        const { html } = await microCMSRichEditorHandler(p.content, {
          transformers: [],
          extractors: {},
        });

        const noHeadings = removeHeadings(html);
        body = htmlToText(noHeadings).slice(0, BODY_MAX);
      }

      return {
        id: p.id,
        title: p.title ?? "",
        description: p.description ?? "",

        // 検索の賢さ用
        category: p.category?.name ?? "",
        tags: (p.tags ?? []).map((t) => t.name).join(" "),

        // 本文（検索用）
        body,
      };
    })
  );

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
