# Playwright 研修テキスト（約30〜40分）

AI（Claude Code）にブラウザを操作させる体験を通して、Playwright の使いどころを掴む研修です。

## 全体の流れ

1. **【Single File】URL を渡してサイトのモックを 1 ファイルで作らせる**（つかみ）
2. **【ヘッドレス】AI が 1 画面ずつ判断して操作**（画面は見えない。スクショで確認）
3. **【拡張機能】同じ操作を実ブラウザで“見える化”**（AI が操作する様子が目で見える → なるほど！）
4. **【スクリプト】毎回 LLM トークンを使わず動かす**（AI にスクリプトを書かせて実行）

練習対象サイト（公開済み）:

```
https://playwright-practice-9ix.pages.dev/
```

TOP から「🟢 ID付きルート」を選び、`名前(テキスト) → 季節(セレクト) → ルート(ラジオ分岐) → ゴール` と進むシンプルなフローです。

---

## 0. 事前準備（約5分）

前提: Claude Code がターミナルに入っていること（= Node.js / npx は導入済み）。
念のため `node -v` が 18 以上か確認。

Playwright MCP をインストール（まだの場合）:

```bash
# 1) ヘッドレス用の MCP を登録（画面を出さずに動く）
claude mcp add playwright --scope user -- npx @playwright/mcp@latest --headless

# 2) ブラウザ本体の取得（初回のみ・数分かかることあり）
npx playwright install chromium

# 3) 接続確認
claude mcp list   # playwright が ✓ Connected ならOK
```

> **⚠️ 重要: 3) の後に Claude Code セッションを再起動してください。**
> MCP はセッション開始時に読み込まれるため、`claude mcp add` した直後の
> 実行中セッションにはまだ反映されていません。`claude` を起動し直すと使えます。

動作テスト（再起動後、Claude Code に貼って確認）:

```
Playwright で https://example.com を開いてスクリーンショットを撮って。
```

スクショが返ってくれば準備完了です。初回はパッケージ/ブラウザの
ダウンロードが走るため、最初の1回だけ時間がかかります。

> 既に `--extension` で登録済みの人は、手順 3【拡張機能】でその設定を使います
> （その場合は手順 2 のヘッドレスを `--headless` で別途試すか、手順 3 から始めてもOK）。

---

## 1.【Single File】URL からサイトのモックを 1 ファイルで作らせる（約7分）

最初に「お、すごい」と思える使い方から。
**URL を 1 つ渡すだけで、そのサイトの見た目を再現した単一 HTML ファイル（HTML + CSS のみ、
バックエンド不要）を AI に作らせる**ことができます。

### サンプルプロンプト（Claude Code にそのまま貼り付け）

```
Playwright で次の URL を開き、その見た目を再現した「単一 HTML ファイル」を作ってください。

URL: https://playwright-practice-9ix.pages.dev/

条件:
- 出力は 1 ファイル（mock.html）だけ。CSS は <style> でインライン化する
- バックエンドや外部通信は不要。ダブルクリックで開けば表示できる状態にする
- 画像・フォントなどの外部依存は極力使わず、HTML と CSS だけで見た目を再現する
- まず browser_navigate で開いて snapshot / screenshot を取り、構造を把握してから作る
- 完成後、mock.html をブラウザで開いて元サイトと見比べ、ズレがあれば直す
```

### ここが面白いポイント

- **`URL:` の行を差し替えるだけ**で、直接アクセスできるページならどんなサイトでも
  「動く単一ファイルのモック」として手元に取得できてしまう。
- 使いどころ: デザインの叩き台、オフラインで開けるサンプル、テスト用のダミー画面づくり、
  「このページのこういうレイアウトを真似たい」という再現。

> ⚠️ 対象は **公開ページのみ**。ログインが必要なページや権限のある画面、
> 利用規約で禁止されているサイトは対象外。学習・検証の範囲で使ってください。

---

## 2.【ヘッドレス】AI が 1 画面ずつ判断して操作（約8分）

画面は表示されません。AI が各画面を見て「何の要素があるか」を自分で判断し、操作して、
指定タイミングでスクリーンショットを撮ります。

### サンプルプロンプト（そのまま貼り付け）

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

---

## 3.【拡張機能】同じ操作を実ブラウザで“見える化”（約10分）

ヘッドレスだと「本当に動いてるの?」となりがち。拡張機能を使うと、
**今開いている Chrome を AI がそのまま操作する**ので、クリックや入力が目で見えます。

### 拡張機能のインストール

1. Chrome ウェブストアで **「Playwright MCP Extension」** をインストール
2. 拡張機能を起動（セッションごとに接続トークンが発行される）

### MCP を拡張機能モードに切り替え

```bash
claude mcp remove playwright
claude mcp add playwright --scope user -- npx @playwright/mcp@latest --extension

claude mcp list   # ✓ Connected を確認
```

### 実行

**手順 2 と同じプロンプトをもう一度貼り付けるだけ。**
今度は Chrome の画面上で、AI が TOP をクリックし、名前を入力し、季節を選び…と
操作していく様子が見えます。これが「AI がブラウザを操作している」の正体です。

---

## 4.【スクリプト】毎回 LLM トークンを使わず動かす（約7分）

手順 2〜3 は便利ですが、**実行のたびに LLM のトークン（＝コスト）を消費**します。
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
**「探索や判断が要る作業は AI（手順1〜3）／決まりきった反復はスクリプト（手順4）」**
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
