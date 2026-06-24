# Playwright 研修テキスト（約30分）

このテキストは Playwright の基本操作を 30 分程度で体験するための研修用です。
練習対象サイトは Cloudflare Pages にホスティングした本リポジトリの `public/` です。

---

## 0. ゴール

- 各端末（Mac / Windows）に Playwright をインストールできる
- ヘッドレスモードでスクリーンショットを撮れる
- Chrome 拡張「PLAYWRIGHT_MCP_EXTENSION」で実ブラウザの動作を目で見られる
- Puppeteer 時代と同様の Script を書いて、拡張入り Chrome を操作できる

---

## 1. インストール（約5分）

### 前提
- Node.js 18 以上（`node -v` で確認）

### 手順
```bash
# プロジェクトを作る場合
mkdir playwright-training && cd playwright-training
npm init -y

# Playwright をインストール
npm install -D @playwright/test
npx playwright install   # ブラウザ本体をダウンロード
```

> Mac / Windows どちらも同じコマンドです。

---

## 2. ヘッドレスでスクリーンショット（約10分）

`shot.spec.js` を作成:

```javascript
const { test } = require('@playwright/test')

test('研修サイトのスクショを撮る', async ({ page }) => {
  await page.goto('https://<あなたのサイト>.pages.dev/')
  await page.screenshot({ path: 'home.png', fullPage: true })

  // フォームページに移動して入力 → スクショ
  await page.getByTestId('link-form').click()
  await page.getByTestId('name').fill('山田 太郎')
  await page.getByTestId('email').fill('taro@example.com')
  await page.getByTestId('agree').check()
  await page.getByTestId('submit').click()
  await page.screenshot({ path: 'form-result.png' })
})
```

実行（ヘッドレスがデフォルト）:
```bash
npx playwright test shot.spec.js
```

生成された `home.png` / `form-result.png` を確認する。

---

## 3. 実ブラウザを目で見る（headed / 拡張）（約10分）

### A. headed モードで見る（拡張なしでもOK）
```bash
npx playwright test shot.spec.js --headed
```
ブラウザが立ち上がり、操作が目で見える。

### B. PLAYWRIGHT_MCP_EXTENSION を使う
- Chrome に拡張「Playwright MCP Extension」をインストール
- 拡張を起動すると接続トークンが発行される（セッションごとに変わる）
- Claude Code など MCP クライアントから `browser_navigate` などで操作すると、
  今開いている Chrome がそのまま動く

> 詳細は `~/.claude/rules/playwright.md` を参照。

---

## 4. よく使う操作（チートシート）

| やりたいこと | コード例 |
|---|---|
| ページ移動 | `await page.goto(url)` |
| testid で取得 | `page.getByTestId('username')` |
| クリック | `await locator.click()` |
| テキスト入力 | `await locator.fill('値')` |
| チェック | `await locator.check()` |
| セレクト選択 | `await page.getByTestId('prefecture').selectOption('tokyo')` |
| ラジオ選択 | `await page.getByTestId('drink-coffee').check()` |
| 表示待ち | `await page.getByTestId('delayed-message').waitFor()` |
| ダイアログ処理 | `page.on('dialog', d => d.accept())` |
| スクショ | `await page.screenshot({ path: 'a.png' })` |
| アサーション | `await expect(locator).toHaveText('...')` |

---

## 5. 練習課題（このサイトで試す）

各ページの要素には `data-testid` が付いています。

1. **フォームページ** (`pages/form.html`)
   - 名前・メール・年齢・メッセージを入力し、規約に同意して送信
   - `form-result` に送信内容が表示されることを確認
2. **ウィジェットページ** (`pages/widgets.html`)
   - ラジオで「紅茶」を選び `drink-selected` が「紅茶」になることを確認
   - セレクトで「大阪府」を選ぶ
   - `+1` を3回押して `counter` が `3` になることを確認
3. **ログインページ** (`pages/login.html`)
   - 誤った情報でログイン → `login-error` が表示される
   - `admin` / `password123` でログイン → `login-success` が表示される
4. **動的要素ページ** (`pages/dynamic.html`)
   - 「読み込み開始」を押し、2秒後に `delayed-message` が出るのを `waitFor` で待つ
   - 確認ダイアログで OK を押し、結果が更新されることを確認

---

## 付録: セレクタの優先順位

1. `getByRole` / `getByLabel` / `getByTestId`（推奨・壊れにくい）
2. `getByText`
3. CSS / XPath（最終手段）
