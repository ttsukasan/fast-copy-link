import {minify} from 'terser'

// jsをテキストとして取得
// github pagesではbase pathが変わることを考慮している TODO: 環境変数にしたい
const fileUrls = ["js/copyLinkTextHtml.js"].map(path => `${window.location.pathname}${path}`);
Promise.all(fileUrls.map(url =>
  fetch(url).then(response => response.text())
)).then(async responses => {
  // ファイルの内容が配列に格納される
  const fileContents = responses;
  const result0 = await minify(fileContents[0], {sourceMap: true});
  // // スクリプトをセットしてボタンを表示
  const button0 = document.getElementById('scriptTextHtml');
  button0.href = `javascript:${result0.code}void(0);`;
  // hidden classを削除して表示
  button0.classList.remove('hidden');


  // const result1 = await minify(fileContents[1], {sourceMap: true});
  // const drawTextareaButtons = document.getElementsByClassName('draw-textarea');
  // console.log(drawTextareaButtons)
  // for (let i = 0; i < drawTextareaButtons.length; i++) {
  //   drawTextareaButtons[i].href = `javascript:${result1.code}void(0);`;
  //   drawTextareaButtons[i].style.display = 'inline';
  // }
}).catch(error => {
  console.error('ファイルを読み込めませんでした。', error);
  // document.getElementById('errorAlert').style.display = 'block';
});
