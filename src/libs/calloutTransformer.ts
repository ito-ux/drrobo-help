// src/libs/calloutTransformer.ts
import type { Transformer } from "microcms-rich-editor-handler";

/**
 * tips-start / caution-start から deco-end までを
 * <aside class="callout tips|caution"> で包む
 *
 * 前提:
 * - microCMSのカスタムclassは span に付くことがある
 * - なので span を起点にしつつ、ラップ対象は「段落(p)などのブロック要素」単位にする
 */
export const calloutTransformer: Transformer = ($) => {
  const END_CLASS = "deco-end";

  const START_TYPES: Array<{ cls: string; type: string }> = [
    { cls: "tips-start", type: "tips" },
    { cls: "caution-start", type: "caution" },
  ];

  // startSpan が入っている「ブロック要素」を探す（必要なら増やせる）
  const BLOCK_SELECTOR = "p, li, blockquote, div, figure";

  for (const { cls, type } of START_TYPES) {
    $(`span.${cls}`).each((_, startSpan) => {
      const $startSpan = $(startSpan);

      // startSpan を含む開始ブロック（通常 p）
      const $startBlock = $startSpan.closest(BLOCK_SELECTOR).first();
      if ($startBlock.length === 0) return;

      // 既にブロック化されていたらスキップ
      if ($startBlock.closest("aside.callout").length) return;

      // startBlock以降にある最初の endSpan を探す
      // （startBlock自身の中も含めて探す）
      const $endSpan = $startBlock
        .nextAll()
        .addBack()
        .find(`span.${END_CLASS}`)
        .first();

      if ($endSpan.length === 0) return; // 終端なし

      // endSpan を含む終了ブロック（通常 p）
      const $endBlock = $endSpan.closest(BLOCK_SELECTOR).first();
      if ($endBlock.length === 0) return;

      // wrapper作成
      const $wrapper = $(`<aside class="callout ${type}"></aside>`);

      // wrapperをstartBlockの直前に挿入
      $startBlock.before($wrapper);

      // startBlockからendBlockまでを wrapper に移動
      let $current = $startBlock;
      while ($current.length) {
        const $next = $current.next();
        $wrapper.append($current);

        if ($current.is($endBlock)) break;
        $current = $next;
      }

      // マーカークラス削除（表示事故防止）
      $wrapper.find(`span.${cls}`).removeClass(cls);
      $wrapper.find(`span.${END_CLASS}`).removeClass(END_CLASS);
    });
  }
};
