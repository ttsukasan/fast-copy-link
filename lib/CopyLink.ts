export class CopyLink {
  type: string;
  toast: HTMLDivElement;
  pageTitle: string;
  pageURL: string;
  copyElement: HTMLElement | null;
  selection: Selection | null;
  copyUsingClipboardAPIHandler: () => void;

  constructor(type: string) {
    this.type = type;
    this.toast = this.initToast();
    // ページタイトルとURLを取得
    this.pageTitle = this.trimTitle(document.title);
    this.pageURL = window.location.href;
    this.copyElement = null;
    this.selection = null;
    // 後からハンドラーを削除できるようにするために、メソッドをバインドしておく
    this.copyUsingClipboardAPIHandler = this.copyUsingClipboardAPIHandler.bind(this);
  }

  trimTitle(title: string): string {
    return title.replace(/(\| 課題の表示 )?\| Backlog$/, '')
      .replace(/-\s[a-zA-Z0-9-]+\.esa\.io$/, '')
      .replace(/^\[(.*?)\]/, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  initToast(): HTMLDivElement {
    const toast = document.createElement('div');
    this.resetStyle(toast);
    toast.style.position = 'fixed';
    toast.style.top = '10px';
    toast.style.left = '10px';
    toast.style.backgroundColor = '#292d3e';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '10000';
    toast.style.fontFamily = 'Arial, sans-serif';
    toast.style.transition = 'opacity .3s ease-in';
    return toast;
  }

  drawToast(message: string, isAutoRemove: boolean, color: 'default' | 'warn' | 'error' = 'default'): void {
    this.toast.style.color = { 'default': '#d0d0d0', 'warn': '#ffcb6b', 'error': '#f07178' }[color];
    this.toast.textContent = message;
    this.toast.style.opacity = '1';
    if (!this.toast.parentNode) {
      document.body.appendChild(this.toast);
    }
    if (isAutoRemove) {
      setTimeout(() => {
        this.toast.style.opacity = '0';
      }, 1500);
      setTimeout(() => {
        if (this.toast.parentNode) {
          document.body.removeChild(this.toast);
        }
      }, 2000);
    }
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

  selectTempDiv(): HTMLDivElement {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.innerHTML = this.copyElement?.outerHTML || '';
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    this.selection = window.getSelection();
    this.selection?.removeAllRanges();
    this.selection?.addRange(range);
    return div;
  }

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
      this.drawToast(`コピーしました: ${this.textContent()}`, true);
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

  copyUsingClipboardAPI(): void {
    let clipboardItem = new ClipboardItem({
      'text/plain': new Blob([this.textContent()], { type: 'text/plain' }),
    });

    if (this.type === 'rt') {
      clipboardItem = new ClipboardItem({
        'text/html': new Blob([this.copyElement?.outerHTML || ''], { type: 'text/html' }),
        'text/plain': new Blob([this.textContent()], { type: 'text/plain' }),
      });
    }

    if (navigator.clipboard && navigator.clipboard.write) {
      navigator.clipboard.write([clipboardItem]).then(() => {
        this.drawToast(`コピーしました: ${this.textContent()}`, true);
      }).catch((error) => {
        console.error('Failed to copy text', error);
      });
    } else {
      console.error('Clipboard not supported');
    }
  }

  textContent(): string {
    return {
      rt: this.pageTitle,
      pt: `${this.pageTitle} - ${this.pageURL}`,
      md: `[${this.pageTitle}](${this.pageURL})`,
    }[this.type];
  }

  copyUsingClipboardAPIHandler(): void {
    document.removeEventListener('click', this.copyUsingClipboardAPIHandler);
    this.copyUsingClipboardAPI();
  }

  exec(): void {
    if (this.type === 'rt') {
      this.copyElement = document.createElement('a');
      this.copyElement.href = this.pageURL;
    } else {
      this.copyElement = document.createElement('span');
    }
    this.copyElement.textContent = this.textContent();
    this.resetStyle(this.copyElement);

    try {
      this.copyUsingGetSelection();
    } catch (e) {
      // getSelectionでコピーできない場合は、Clipboard APIを使う
      document.addEventListener('click', this.copyUsingClipboardAPIHandler);
      this.drawToast('⚠️ ページ内をクリックしてコピーを完了します。', false, 'warn');
    }
  }
}
