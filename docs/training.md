# Playwright 研修テキスト（約30分）

AI（Claude Code）にブラウザを操作させる体験を通して、Playwright の使いどころを掴む研修です。

## 全体の流れ

1. **【ヘッドレス】AI が 1 画面ずつ判断して操作**（画面は見えない。スクショで確認）
2. **【拡張機能】同じ操作を実ブラウザで“見える化”**（AI が操作している様子が目で見える → なるほど！）
3. **【スクリプト】毎回 LLM トークンを使わず動かす**（AI にスクリプトを書かせて実行）

練習対象サイト（公開済み）:

```
https://playwright-practice-9ix.pages.dev/
```

TOP から「🟢 ID付きルート」を選び、`名前(テキスト) → 季節(セレクト) → ルート(ラジオ分岐) → ゴール` と進むシンプルなフローです。

---

## 0. 事前準備（約5分）

前提: Node.js 18 以上（`node -v`）と Claude Code。

Playwright MCP をインストール（まだの場合）:

```bash
# ① ヘッドレス用（画面を出さずに動く）
claude mcp add playwright --scope user -- npx @playwright/mcp@latest --headless

# ブラウザ本体の取得（初回のみ）
npx playwright install chromium

# 確認
claude mcp list   # playwright が ✓ Connected ならOK
```

> 既に `--extension` で登録済みの人は、後半の【②拡張機能】でその設定を使います。

---

## 1.【ヘッドレス】AI が 1 画面ずつ判断して操作（約8分）

画面は表示されません。AI が各画面を見て「何の要素があるか」を自分で判断し、操作して、
指定タイミングでスクリーンショットを撮ります。

### サンプルプロンプト（Claude Code にそのまま貼り付け）

```
Playwright（ヘッドレス）で次の研修サイトを操作してください。
URL: https://playwright-practice-9ix.pages.dev/

進め方:
1. TOP ページを開き、スクリーンショットを撮る
2. 「ID付きルート」のボタンを押して進む
3. ここから先は 1 画面ずつ、画面に何の入力要素があるかを自分で確認・判断して操作する
   - テキストボックスがあれば任意の名前を入力
   - セレクトボックスがあれば好きな季節を選ぶ
   - ラジオボタンがあれば「山ルート」を選ぶ
4. 各画面で「操作する前」と「次へ進んだ直後」の 2 枚スクリーンショットを撮る
5. ゴール画面に着いたらスクリーンショットを撮り、表示されている内容を報告する
```

ポイント:
- 手順 3 が「AI が 1 画面ずつ判断する」部分。要素の種類を教えず、AI に見て選ばせる。
- スクショのタイミング（操作前・遷移後・ゴール）を明示している。
- このプロンプトは Playwright MCP が入っていればそのまま動きます。

---

## 2.【拡張機能】同じ操作を実ブラウザで“見える化”（約10分）

ヘッドレスだと「本当に動いてるの?」となりがち。拡張機能を使うと、
**今開いている Chrome を AI がそのまま操作する**ので、クリックや入力が目で見えます。

### 拡張機能のインストール

1. Chrome ウェブストアで **「Playwright MCP Extension」** をインストール
2. 拡張機能を起動（セッションごとに接続トークンが発行される）

### MCP を拡張機能モードに切り替え

```bash
# 一度削除してから --extension で登録し直す
claude mcp remove playwright
claude mcp add playwright --scope user -- npx @playwright/mcp@latest --extension

claude mcp list   # ✓ Connected を確認
```

### 実行

**手順 1 と同じプロンプトをもう一度貼り付けるだけ。**
今度は Chrome の画面上で、AI が TOP をクリックし、名前を入力し、季節を選び…と
操作していく様子が見えます。これが「AI がブラウザを操作している」の正体です。

---

## 3.【スクリプト】毎回 LLM トークンを使わず動かす（約7分）

手順 1〜2 は便利ですが、**実行のたびに LLM のトークン（＝コスト）を消費**します。
毎回同じ操作をするなら、一度スクリプトにしてしまえば LLM 不要・高速・無料で何度でも回せます。

### スクリプトを AI に書かせるプロンプト

```
さっき操作したフローを Playwright のテストスクリプトに書き起こしてください。

- ファイル名: tests/flow.spec.js
- 対象: https://playwright-practice-9ix.pages.dev/
- TOP で「ID付きルート」を選択
- 名前に「山田太郎」を入力 / 季節は「秋」 / 「山ルート」を選択
- 最後にゴール見出しが「山ルートでゴール！」であることを expect で検証
- 各ステップの後にスクリーンショットを撮る（screenshots/ に保存）
- 要素は getByTestId など壊れにくいセレクタで指定する
```

### 生成されたスクリプトの実行コマンド

```bash
# 初回だけ: テストランナーを入れる
npm install -D @playwright/test
npx playwright install chromium

# 実行（ヘッドレス・LLM トークンは消費しない）
npx playwright test tests/flow.spec.js

# 操作を目で見たいとき
npx playwright test tests/flow.spec.js --headed
```

これで完了です。
**「探索や判断が要る作業は AI（手順1・2）／決まりきった反復はスクリプト（手順3）」**
という Playwright の使い分けが体感できれば研修のゴールです。

---

## 付録: 生成されるスクリプトの例

```javascript
const { test, expect } = require('@playwright/test')

const BASE = 'https://playwright-practice-9ix.pages.dev'

test('IDルート: 山ルートでゴール', async ({ page }) => {
  await page.goto(`${BASE}/`)
  await page.getByTestId('route-id').click()
  await page.screenshot({ path: 'screenshots/01-top.png' })

  await page.getByTestId('name').fill('山田太郎')
  await page.getByTestId('next').click()
  await page.screenshot({ path: 'screenshots/02-name.png' })

  await page.getByTestId('season').selectOption('秋')
  await page.getByTestId('next').click()

  await page.getByTestId('route-mountain').check()
  await page.getByTestId('next').click()

  await expect(page.getByTestId('goal-title')).toHaveText('山ルートでゴール！')
  await page.screenshot({ path: 'screenshots/03-goal.png' })
})
```

> IDなしルート（`noid/`）は `getByRole` / `getByLabel` / `getByPlaceholder` で
> 指定する応用練習に使えます。
