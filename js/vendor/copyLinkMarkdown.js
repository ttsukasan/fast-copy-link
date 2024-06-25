window.__tt ||= {}
__tt.CopyLink = class {

  constructor(type) {
    this.type = type || 'plain'
    this.toast = document.createElement('div')
    this.toast.textContent = ''
    this.toast.style.position = 'fixed'
    this.toast.style.top = '10px'
    this.toast.style.left = '10px'
    this.toast.style.backgroundColor = '#292d3e'
    this.toast.style.color = '#d0d0d0'
    this.toast.style.padding = '10px'
    this.toast.style.borderRadius = '5px'
    this.toast.style.zIndex = '10000'
    this.toast.style.fontFamily = 'Arial, sans-serif'
    this.toast.style.transition = 'opacity .3s ease-in'
    // ページタイトルとURLを取得
    this.pageTitle = this.trimTitle(document.title)
    this.pageURL = window.location.href
    this.copyElement = null
    this.successMessage = ''
    this.selection = null
    // 後からハンドラーを削除できるようにするために、メソッドをバインドしておく
    this.copyUsingClipboardAPIHandler = this.copyUsingClipboardAPIHandler.bind(this)
  }

  trimTitle(title) {
    return title.replace(/(\| 課題の表示 )?\| Backlog$/, '')
      .replace(/-\s[a-zA-Z0-9-]+\.esa\.io$/, '')
      .replace(/^\[(.*?)\]/, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  updateToast(message, color = 'default') {
    this.toast.style.color = {'default': '#d0d0d0', 'warn': '#ffcb6b', 'error': '#f07178'}[color]
    this.toast.textContent = message
  }

  showToast() {
    this.toast.style.opacity = '1'
    document.body.appendChild(this.toast)
  }

  hideToast() {
    setTimeout(() => {
      this.toast.style.opacity = '0'
    }, 1500)
    setTimeout(() => {
      document.body.removeChild(this.toast)
    }, 2000)
  }

  resetStyle(el) {
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

  selectTempDiv() {
    var div = document.createElement('div')
    div.contentEditable = true
    div.innerHTML = this.copyElement.outerHTML
    document.body.appendChild(div)
    var range = document.createRange()
    range.selectNodeContents(div)
    this.selection = window.getSelection()
    this.selection.removeAllRanges()
    this.selection.addRange(range)
    return div
  }

  selectTextarea() {
    var textarea = document.createElement('textarea')
    textarea.value = this.copyElement.textContent
    document.body.appendChild(textarea)
    textarea.select()
    return textarea
  }

  copyUsingGetSelection() {
    var dom = null
    try {
      if (this.type === 'textHtml') {
        dom = this.selectTempDiv()
      } else {
        dom = this.selectTextarea()
      }

      if (!document.execCommand('copy')) {
        throw new Error('Failed execCommand')
      }

      this.updateToast(this.successMessage)
      this.showToast()
      this.hideToast()
    } catch (err) {
      console.warn('Failed to copy text using getSelection', err)
      throw err
    } finally {
      if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom)
      }
      this.selection && this.selection.removeAllRanges()
    }
  }

  copyUsingClipboardAPI() {
    let clipboardItem = new ClipboardItem({
      'text/plain': new Blob([this.copyElement.textContent], {type: 'text/plain'}),
    })

    if (this.type === 'textHtml') {
      clipboardItem = new ClipboardItem({
        'text/html': new Blob([this.copyElement.outerHTML], {type: 'text/html'}),
        'text/plain': new Blob([this.copyElement.textContent], {type: 'text/plain'}),
      })
    }
    if (navigator.clipboard && navigator.clipboard.write) {
      navigator.clipboard.write([clipboardItem]).then(() => {
        this.updateToast(this.successMessage)
        this.hideToast()
      }).catch((error) => {
        console.error('Failed to copy text', error)
      })
    } else {
      console.error('Clipboard not supported')
    }
  }

  copyUsingClipboardAPIHandler() {
    document.removeEventListener('click', this.copyUsingClipboardAPIHandler)
    this.copyUsingClipboardAPI()
  }

  exec() {
    if (this.type === 'textHtml') {
      this.copyElement = document.createElement('a')
      this.copyElement.href = this.pageURL
      this.copyElement.textContent = this.pageTitle
    } else if (this.type === 'markdown') {
      this.copyElement = document.createElement('span')
      this.copyElement.textContent = `[${this.pageTitle}](${this.pageURL})`
    } else {
      this.copyElement = document.createElement('span')
      this.copyElement.textContent = `${this.pageTitle} - ${this.pageURL}`
    }
    this.resetStyle(this.copyElement)
    this.successMessage = `コピーしました: ${this.copyElement.textContent}`

    // getSelectionでコピーできない場合は、Clipboard APIを使う
    try {
      this.copyUsingGetSelection()
    } catch (e) {
      document.addEventListener('click', this.copyUsingClipboardAPIHandler)
      this.updateToast('⚠️ ページ内をクリックしてコピーを完了します。', 'warn')
      this.showToast()
    }
  }

  static textHtml() {
    new __tt.CopyLink('textHtml').exec()
  }

  static plain() {
    new __tt.CopyLink('plain').exec()
  }

  static markdown() {
    new __tt.CopyLink('markdown').exec()
  }
}

__tt.CopyLink.markdown()
