// 共通ナビゲーション。現在のページにactiveクラスを付ける。
const links = [
  { href: 'index.html', label: 'ホーム' },
  { href: 'pages/form.html', label: 'フォーム' },
  { href: 'pages/widgets.html', label: 'ウィジェット' },
  { href: 'pages/login.html', label: 'ログイン' },
  { href: 'pages/dynamic.html', label: '動的要素' },
]

function buildNav() {
  const nav = document.querySelector('nav[data-testid="main-nav"]')
  if (!nav) return

  // ページ階層に応じた相対パスのプレフィックスを決める
  const depth = nav.dataset.depth === 'sub' ? '../' : ''
  const current = window.location.pathname.split('/').pop()

  const html = links
    .map((link) => {
      const href = `${depth}${link.href}`
      const target = link.href.split('/').pop()
      const isActive = target === current
      return `<a href="${href}" data-testid="nav-${target.replace('.html', '')}"${
        isActive ? ' class="active"' : ''
      }>${link.label}</a>`
    })
    .join('')

  nav.innerHTML = html
}

document.addEventListener('DOMContentLoaded', buildNav)
