import {minify} from 'terser';

// jsをテキストとして取得
// github pagesではbase pathが変わることを考慮している TODO: 環境変数にしたい
const fileUrls = [
  "js/vendor/minified/copyLinkTextHtml.js",
  "js/vendor/minified/copyLinkMarkdown.js",
  "js/vendor/minified/copyLinkPlaintext.js"
].map(path => `${window.location.pathname}${path}`);

async function applyScript(fileResponse: Awaited<string>, selector: string) {
  const elList = document.querySelectorAll(selector) as NodeListOf<HTMLAnchorElement>;
  const minified = await minify(fileResponse, {sourceMap: false});
  elList.forEach(el => {
    el.href = `javascript:${minified.code}void(0);`
    el.classList.remove('hidden')
  })
}

Promise.all(fileUrls.map(url =>
  fetch(url).then(response => response.text())
)).then(async responses => {
  await applyScript(responses[0], '.script-text-html');
  await applyScript(responses[1], '.script-markdown');
  await applyScript(responses[2], '.script-plaintext');
}).catch(error => {
  console.error('ファイルを読み込めませんでした。', error);
});
