import {minify} from 'terser';

// jsをテキストとして取得
// github pagesではbase pathが変わることを考慮している TODO: 環境変数にしたい
const fileUrls = [
  "js/vendor/copyLinkTextHtml.js",
  "js/vendor/copyLinkMarkdown.js",
  "js/vendor/copyLinkPlaintext.js"
].map(path => `${window.location.pathname}${path}`);

async function applyScript(fileResponse: Awaited<string>, el: HTMLAnchorElement) {
  const minified = await minify(fileResponse, {sourceMap: false});
  el.href = `javascript:${minified.code}void(0);`;
  el.classList.remove('hidden');
}

Promise.all(fileUrls.map(url =>
  fetch(url).then(response => response.text())
)).then(async responses => {
  await applyScript(responses[0], document.getElementById('scriptTextHtml') as HTMLAnchorElement);
  await applyScript(responses[1], document.getElementById('scriptMarkdown') as HTMLAnchorElement);
  await applyScript(responses[2], document.getElementById('scriptPlaintext') as HTMLAnchorElement);
}).catch(error => {
  console.error('ファイルを読み込めませんでした。', error);
});
