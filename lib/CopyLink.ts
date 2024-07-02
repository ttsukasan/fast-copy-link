export class CopyLink {
  type: string
  toast: HTMLDivElement
  pageTitle: string
  pageURL: string
  anchorEl: HTMLAnchorElement
  selection: Selection | null

  mount() {
    if (document.getElementById('__tt_fcl')?.dataset.active) {
      return false;
    }

    // ページタイトルとURLを取得
    this.pageTitle = this.trimTitle(document.title);
    this.pageURL = window.location.href;
    this.selection = null;
    // トースト、メニューの描画
    this.initToast();
    this.drawMenu();
    if (!this.toast.parentNode) {
      document.body.appendChild(this.toast);
    }
    // クリックイベントの作成
    Array.from(document.getElementsByClassName('__tt_fcl_btn')).forEach(el => {
      el.addEventListener('click', (ev) => {
        // type rt/md/pt
        this.type = (el as HTMLElement).dataset.type
        try {
          this.copyUsingClipboardAPI()
        } catch (e) {
          // Clipboard APIに失敗したら getSelectionも試してみる
          this.copyUsingGetSelection()
        }
      })
    })
  }

  trimTitle(title: string): string {
    return title.replace(/(\| 課題の表示 )?\| Backlog$/, '')
      .replace(/-\s[a-zA-Z0-9-]+\.esa\.io$/, '')
      .replace(/^\[(.*?)\]/, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  initToast(): HTMLDivElement {
    document.getElementById("__tt_fcl")?.remove()
    this.toast = document.createElement('div')
    this.resetStyle(this.toast)
    this.toast.id = '__tt_fcl'
    this.toast.style.position = 'fixed'
    this.toast.style.top = '10px'
    this.toast.style.left = '10px'
    this.toast.style.backgroundColor = '#292d3e'
    this.toast.style.padding = '15px'
    this.toast.style.borderRadius = '5px'
    this.toast.style.zIndex = `${Number.MAX_SAFE_INTEGER}`
    this.toast.style.fontFamily = 'Arial, sans-serif'
    this.toast.style.transition = 'opacity .3s ease-in'
    this.toast.style.color = '#fffefe'
    this.toast.style.opacity = '1';
    this.toast.dataset.active = "1";
    return this.toast
  }

  drawMenu(): void {
    this.toast.innerHTML = [
      `<div>コピー形式を選択してください。</div>`,
      `<div class="__tt_fcl_btn" data-type="rt">ハイパーリンク ▶︎ <u>ページタイトル</u></div>`,
      `<div class="__tt_fcl_btn" data-type="md">︎Markdown ▶︎ [ページタイトル](URL)</div>`,
      `<div class="__tt_fcl_btn" data-type="pt">テキスト ▶︎ ページタイトル - URL</div>`].join('');
    Array.from(this.toast.children).forEach((e, index) => {
      let row = e as HTMLElement
      this.resetStyle(row)
      row.style.color = '#fffefe';
      if (index !== 0) {
        row.style.cursor = 'pointer'
        row.style.border = '1px solid #ABB2BF'
        row.style.borderRadius = '5px'
        row.style.padding = '5px 15px'
      }
      if (index !== 3) {
        row.style.marginBottom = `15px`
      }
    })
  }

  drawToast(message: string, isAutoRemove: boolean): void {
    this.toast.textContent = message;
    if (isAutoRemove) {
      this.removeToast()
    }
  }

  removeToast() {
    this.toast.dataset.active = "";
    setTimeout(() => {
      this.toast.style.opacity = '0';
      setTimeout(() => {
        if (this.toast.parentNode) {
          document.body.removeChild(this.toast);
        }
      }, 500);
    }, 1000);
  }

  resetStyle(el: HTMLElement): void {
    let i = 'initial';
    el.style.color = i;
    el.style.textDecoration = i;
    el.style.fontFamily = i;
    el.style.fontSize = i;
    el.style.fontWeight = i;
    el.style.lineHeight = i;
    el.style.letterSpacing = i;
    el.style.textAlign = i;
    el.style.textTransform = i;
    el.style.textIndent = i;
    el.style.backgroundColor = i;
  }

  copyUsingClipboardAPI(): void {
    let cItem: ClipboardItem

    if (this.type === 'rt') {
      cItem = new ClipboardItem({
        'text/html': new Blob([this.anchorElement().outerHTML], {type: 'text/html'}),
        'text/plain': new Blob([this.textContent()], {type: 'text/plain'}),
      });
    } else {
      cItem = new ClipboardItem({'text/plain': new Blob([this.textContent()], {type: 'text/plain'}),});
    }

    if (navigator.clipboard && navigator.clipboard.write) {
      navigator.clipboard.write([cItem]).then(() => {
        this.drawToast(`📋 コピーしました: ${this.textContent()}`, true);
      }).catch((err) => {
        console.error('Failed to copy text', err)
        throw err
      });
    } else {
      console.error('Clipboard not supported')
      throw Error('Clipboard not supported')
    }
  }

  // リンクタグを作成
  anchorElement(): HTMLAnchorElement {
    if (!this.anchorEl) {
      this.anchorEl = document.createElement('a');
      this.anchorEl.href = this.pageURL;
      this.anchorEl.textContent = this.textContent();
      this.resetStyle(this.anchorEl);
    }
    return this.anchorEl
  }

  textContent(): string {
    return {
      rt: this.pageTitle,
      pt: `${this.pageTitle} - ${this.pageURL}`,
      md: `[${this.pageTitle}](${this.pageURL})`,
    }[this.type];
  }

  // コピー用要素を作成（リッチテキスト用）
  selectTempDiv(): HTMLDivElement {
    const div = document.createElement('div');
    div.innerHTML = this.anchorElement().outerHTML;
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    this.selection = window.getSelection();
    this.selection.removeAllRanges();
    this.selection.addRange(range);
    return div;
  }

  // コピー用テキストボックスを作成（プレーンテキスト用）
  selectTextarea(): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.value = this.textContent();
    document.body.appendChild(textarea);
    textarea.select();
    return textarea;
  }

  execCopyCommand(): void {
    if (!document.execCommand('copy')) {
      throw new Error('Failed execCommand');
    }
  }

  copyUsingGetSelection(): void {
    let dom: HTMLDivElement | HTMLTextAreaElement | undefined;
    try {
      if (this.type === 'rt') {
        dom = this.selectTempDiv();
      } else {
        dom = this.selectTextarea();
      }
      this.execCopyCommand();
      this.drawToast(`📋 コピーしました: ${this.textContent()}`, true);
    } catch (err) {
      console.warn('Failed to copy text using getSelection', err);
      throw err;
    } finally {
      if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
      this.selection?.removeAllRanges();
    }
  }


}
