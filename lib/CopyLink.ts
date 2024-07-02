export class CopyLink {
  type: string
  toast: HTMLDivElement
  pageTitle: string
  pageURL: string
  anchorEl: HTMLAnchorElement
  // Gogh color
  colors: { txt: string, bg: string, gray: string } = {txt: '#FFFEFE', bg: '#292D3E', gray: '#ABB2BF'}

  mount() {
    if (document.getElementById('__tt_fcl')?.dataset.active) {
      return false
    }

    this.pageTitle = this.trimTitle(document.title)
    this.pageURL = window.location.href

    this.toast = this.initToast()
    this.drawMenu()

    if (!this.toast.parentNode) {
      document.body.appendChild(this.toast)
    }

    this.addClickEvents()
  }

  trimTitle(title: string): string {
    return title.replace(/(\| 課題の表示 )?\| Backlog$/, '')
      .replace(/-\s[a-zA-Z0-9-]+\.esa\.io$/, '')
      .replace(/^\[(.*?)\]/, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  initToast(): HTMLDivElement {
    document.getElementById('__tt_fcl')?.remove()
    const toast = document.createElement('div')
    this.resetStyle(toast)
    toast.id = '__tt_fcl'
    toast.style.position = 'fixed'
    toast.style.top = '10px'
    toast.style.left = '10px'
    toast.style.backgroundColor = this.colors.bg
    toast.style.padding = '15px'
    toast.style.borderRadius = '5px'
    toast.style.zIndex = `${Number.MAX_SAFE_INTEGER}`
    toast.style.fontFamily = 'Arial, sans-serif'
    toast.style.transition = 'opacity .3s ease-in'
    toast.style.color = this.colors.txt
    toast.style.opacity = '1'
    toast.dataset.active = '1'
    return toast
  }

  drawMenu(): void {
    this.drawToast('コピー形式を選択してください。', false)
    this.toast.appendChild(this.createButtonDiv('rt', 'ハイパーリンク ▶︎ ', 'ページタイトル'))
    this.toast.appendChild(this.createButtonDiv('md', 'Markdown ▶︎ [ページタイトル](URL)'))
    this.toast.appendChild(this.createButtonDiv('pt', 'テキスト ▶︎ ページタイトル - URL'))
  }

  createButtonDiv(type: string, text: string, underlineText: string = '') {
    const btn = document.createElement('div')
    btn.className = '__tt_fcl_btn'
    btn.dataset.type = type
    btn.textContent = text
    btn.style.color = this.colors.txt
    btn.style.cursor = 'pointer'
    btn.style.border = `1px solid ${this.colors.gray}`
    btn.style.borderRadius = '5px'
    btn.style.padding = '5px 15px'
    btn.style.marginTop = `15px`

    if (underlineText) {
      const underline = document.createElement('span')
      this.resetStyle(underline)
      underline.style.textDecoration = 'underline'
      underline.style.color = this.colors.txt
      underline.textContent = underlineText
      btn.appendChild(underline)
    }
    return btn
  }

  drawToast(message: string, isAutoRemove: boolean): void {
    this.toast.textContent = message
    if (isAutoRemove) {
      this.removeToast()
    }
  }

  removeToast() {
    this.toast.dataset.active = ''
    setTimeout(() => {
      this.toast.style.opacity = '0'
      setTimeout(() => {
        if (this.toast.parentNode) {
          document.body.removeChild(this.toast)
        }
      }, 500)
    }, 1000)
  }

  resetStyle(el: HTMLElement): void {
    let i = 'initial'
    el.style.color = i
    el.style.textDecoration = i
    el.style.fontFamily = i
    el.style.fontSize = i
    el.style.fontWeight = i
    el.style.lineHeight = i
    el.style.letterSpacing = i
    el.style.textAlign = i
    el.style.textTransform = i
    el.style.textIndent = i
    el.style.backgroundColor = i
  }

  addClickEvents(): void {
    Array.from(document.getElementsByClassName('__tt_fcl_btn')).forEach(el => {
      el.addEventListener('click', (ev) => {
        this.type = (el as HTMLElement).dataset.type
        try {
          this.copyUsingClipboardAPI()
        } catch (e) {
          this.drawToast('⚠️ コピーに失敗しました。', true)
        }
      })
    })
  }

  copyUsingClipboardAPI(): void {
    let cItem: ClipboardItem

    if (this.type === 'rt') {
      cItem = new ClipboardItem({
        'text/html': new Blob([this.anchorElement().outerHTML], {type: 'text/html'}),
        'text/plain': new Blob([this.textContent()], {type: 'text/plain'}),
      })
    } else {
      cItem = new ClipboardItem({'text/plain': new Blob([this.textContent()], {type: 'text/plain'})})
    }

    navigator.clipboard.write([cItem]).then(() => {
      this.drawToast(`コピーしました: ${this.textContent()}`, true)
    }).catch((err) => {
      throw err
    })
  }

  anchorElement(): HTMLAnchorElement {
    if (!this.anchorEl) {
      this.anchorEl = document.createElement('a')
      this.anchorEl.href = this.pageURL
      this.anchorEl.textContent = this.textContent()
      this.resetStyle(this.anchorEl)
    }
    return this.anchorEl
  }

  textContent(): string {
    return {
      rt: this.pageTitle,
      md: `[${this.pageTitle}](${this.pageURL})`,
      pt: `${this.pageTitle} - ${this.pageURL}`,
    }[this.type]
  }
}
