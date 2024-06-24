window.__tt ||= {}
__tt.CopyLink = class {

  constructor(type) {
    // this.index = index
    this.type = type || 'plain'
    this.toast = document.createElement('div')
    this.toast.textContent = `Copied:`
    this.toast.style.position = 'fixed'
    this.toast.style.top = '10px'
    this.toast.style.left = '10px'
    this.toast.style.backgroundColor = '#292d3e'
    this.toast.style.color = '#d0d0d0'
    this.toast.style.padding = '10px'
    this.toast.style.borderRadius = '5px'
    this.toast.style.zIndex = '10000'
    this.toast.style.fontFamily = 'Arial, sans-serif'
    this.toast.style.transition = 'opacity .5s ease-in'
    // ページタイトルとURLを取得
    this.pageTitle = document.title
    this.pageURL = window.location.href
    this.copyElement = null
    this.successMessage = ''
    // 後からハンドラーを削除できるようにするために、メソッドをバインドしておく
    this.copyUsingClipboardAPIHandler = this.copyUsingClipboardAPIHandler.bind(this)

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
    }, 2000)
    setTimeout(() => {
      document.body.removeChild(this.toast)
    }, 2500)
  }

  resetStyle(el) {
    el.style.color = 'initial'
    el.style.textDecoration = 'initial'
    el.style.fontFamily = 'initial'
    el.style.fontSize = 'initial'
    el.style.fontWeight = 'initial'
    el.style.lineHeight = 'initial'
    el.style.letterSpacing = 'initial'
    el.style.textAlign = 'initial'
    el.style.textTransform = 'initial'
    el.style.textIndent = 'initial'
    el.style.backgroundColor = 'initial'
  }

  copyUsingGetSelection() {
    var tempDiv = document.createElement('div')
    this.resetStyle(tempDiv)
    var success = false
    var selection = window.getSelection()

    try {
      tempDiv.contentEditable = true
      tempDiv.innerHTML = this.copyElement.outerHTML
      document.body.appendChild(tempDiv)

      var range = document.createRange()
      range.selectNodeContents(tempDiv)

      // selection.removeAllRanges()
      // selection.addRange(range)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      document.execCommand('copy')
      this.updateToast(this.successMessage)
      this.showToast()
      this.hideToast()
      success = true
    } catch (err) {
      console.warn('Failed to copy text using getSelection: ', err)
    } finally {
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv)
      }
      // selection && selection.removeAllRanges()
      window.getSelection().removeAllRanges()

    }
    return success
  }

  copyUsingClipboardAPI() {
    let clipboardItem = new ClipboardItem({
      'text/plain': new Blob([this.copyElement.textContent], {type: 'text/plain'}),
    })

    if (this.type === 'textHtml') {
      clipboardItem = new ClipboardItem({
        'text/html': new Blob([this.copyElement.outerHTML], {type: 'text/html'}),
        'text/plain': new Blob([`[${this.pageTitle}](${this.pageURL})`], {type: 'text/plain'}),
      })
    }
    // var item = {
    //   "textHtml": new Blob([this.copyElement.outerHTML], { type: "text/html" }),
    //   "plain": new Blob([this.copyElement.textContent], { type: "text/plain" }),
    //   "markdown": new Blob([this.copyElement.textContent], { type: "text/plain" })
    // }[this.type]
    if (navigator.clipboard && navigator.clipboard.write) {

      // 'text/plain': new Blob([this.pageTitle + ' - ' + this.pageURL], {type: 'text/plain'}),
      navigator.clipboard.write([
        clipboardItem,
        // new ClipboardItem({
        //   [item.type]: item
        // })
      ]).then(() => {

        // console.log(item, item.type)
        console.log(this.copyElement.outerHTML)
        this.updateToast(this.successMessage)
        this.hideToast()
      }).catch((error) => {
        console.error('Failed to copy text using Clipboard API: ', error)
      })
    } else {
      console.warn('Clipboard API is not supported')
    }
  }

  copyUsingClipboardAPIHandler() {
    document.removeEventListener('click', this.copyUsingClipboardAPIHandler)
    setTimeout(() => {
      this.copyUsingClipboardAPI()
    }, 100)
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
    if (!this.copyUsingGetSelection()) {
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

__tt.CopyLink.textHtml()
// __tt.CopyLink.plain()
