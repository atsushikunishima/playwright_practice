# Playwright 研修テキスト（約30分）

このテキストは Playwright の基本操作を 30 分程度で体験するための研修用です。
練習対象は Cloudflare Pages にホスティングした本リポジトリの `public/` です。

サイトは「1 画面 1 要素 ＋ 次へ」のシンプルなフロー型です。
ラジオの選択で分岐し、2 つのゴールのどちらかに辿り着きます。

```
index.html (スタート)
  → steps/name.html    STEP1: テキストボックス
  → steps/season.html  STEP2: セレクトボックス
  → steps/route.html   STEP3: ラジオボタン（分岐）
       ├─ 山ルート → goals/mountain.html
       └─ 海ルート → goals/sea.html
```

---

## 0. ゴール

- 各端末（Mac / Windows）に Playwright をインストールできる
- ヘッドレスモードでスクリーンショットを撮れる
- Chrome 拡張「PLAYWRIGHT_MCP_EXTENSION」で実ブラウザの動作を目で見られる
- フローを最後まで操作するスクリプトを書ける

---

## 1. インストール（約5分）

前提: Node.js 18 以上（`node -v` で確認）

```bash
mkdir playwright-training && cd playwright-training
npm init -y
npm install -D @playwright/test
npx playwright install   # ブラウザ本体をダウンロード
```

> Mac / Windows どちらも同じコマンドです。

---

## 2. フローを最後まで操作する（約10分）

各要素に `data-testid` が付いているので、セレクタは `getByTestId` で安定して書けます。
「次へ」ボタンはどの画面でも `data-testid="next"` で統一しています。

`flow.spec.js`:

```javascript
const { test, expect } = require('@playwright/test')

const BASE = 'https://<あなたのサイト>.pages.dev'

test('山ルートでゴールする', async ({ page }) => {
  await page.goto(`${BASE}/`)
  await page.getByTestId('start').click()          // STEP0 → 1

  await page.getByTestId('name').fill('山田 太郎')  // STEP1 テキスト
  await page.getByTestId('next').click()

  await page.getByTestId('season').selectOption('秋') // STEP2 セレクト
  await page.getByTestId('next').click()

  await page.getByTestId('route-mountain').check()  // STEP3 ラジオ（分岐）
  await page.getByTestId('next').click()

  // ゴール確認
  await expect(page.getByTestId('goal-title')).toHaveText('山ルートでゴール！')
  await expect(page.getByTestId('summary-name')).toHaveText('山田 太郎')
  await page.screenshot({ path: 'goal-mountain.png' })
})
```

実行（ヘッドレスがデフォルト）:
```bash
npx playwright test flow.spec.js
```

---

## 3. 実ブラウザを目で見る（約10分）

### A. headed モード
```bash
npx playwright test flow.spec.js --headed
```
ブラウザが立ち上がり、操作が目で見えます。

### B. PLAYWRIGHT_MCP_EXTENSION
- Chrome に拡張「Playwright MCP Extension」をインストール
- 拡張を起動すると接続トークンが発行される（セッションごとに変わる）
- Claude Code など MCP クライアントから `browser_navigate` などで操作すると、
  今開いている Chrome がそのまま動く

> 詳細は `~/.claude/rules/playwright.md` を参照。

---

## 4. 練習課題

1. **海ルートに分岐させる**
   - STEP3 で `route-sea` を選び、ゴールが「海ルートでゴール！」になることを確認
2. **入力した名前がゴールに表示されることを確認**
   - `summary-name` が入力値と一致するか `expect` で検証
3. **季節を変える**
   - `selectOption('冬')` にしてスクショを撮る
4. **2 パターンを 1 ファイルで**
   - 山ルートと海ルートの 2 テストを書き、両方 green にする

---

## 5. チートシート

| やりたいこと | コード例 |
|---|---|
| ページ移動 | `await page.goto(url)` |
| testid で取得 | `page.getByTestId('name')` |
| クリック | `await locator.click()` |
| テキスト入力 | `await locator.fill('値')` |
| セレクト選択 | `await page.getByTestId('season').selectOption('秋')` |
| ラジオ選択 | `await page.getByTestId('route-sea').check()` |
| テキスト検証 | `await expect(locator).toHaveText('...')` |
| スクショ | `await page.screenshot({ path: 'a.png' })` |
