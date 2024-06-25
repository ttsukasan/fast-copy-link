import {minify} from 'terser';

// jsをテキストとして取得
// github pagesではbase pathが変わることを考慮している TODO: 環境変数にしたい
const fileUrls = [
  "js/vendor/copyLinkTextHtml.js",
  "js/vendor/copyLinkMarkdown.js",
  "js/vendor/copyLinkPlaintext.js"
].map(path => `${window.location.pathname}${path}`);

Promise.all(fileUrls.map(url =>
  fetch(url).then(response => response.text())
)).then(async responses => {
  // ファイルの内容が配列に格納される
  const fileContents = responses;

  const result0 = await minify(fileContents[0], {sourceMap: true});
  const button0 = document.getElementById('scriptTextHtml') as HTMLAnchorElement;
  button0.href = `javascript:${result0.code}void(0);`;
  button0.classList.remove('hidden');

  const result1 = await minify(fileContents[1], {sourceMap: true});
  const button1 = document.getElementById('scriptMarkdown') as HTMLAnchorElement;
  button1.href = `javascript:${result1.code}void(0);`;
  button1.classList.remove('hidden');

  const result2 = await minify(fileContents[2], {sourceMap: true});
  const button2 = document.getElementById('scriptPlaintext') as HTMLAnchorElement;
  button2.href = `javascript:${result2.code}void(0);`;
  button2.classList.remove('hidden');
}).catch(error => {
  console.error('ファイルを読み込めませんでした。', error);
});
