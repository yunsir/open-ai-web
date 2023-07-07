import Markdown from "markdown-it";
import highlight from "highlight.js";



const mdOptions: Markdown.Options = {
  linkify: true,
  typographer: true,
  breaks: true,
  langPrefix: "language-",
  // 代码高亮
  highlight(str, lang) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return (
          `<pre class="code-block-wrapper">`+
          `<div class="code-block-header"><span class="code-block-header__lang">${lang}</span>`+
          `<span class="code-block-header__copy" onClick="((e) =>{var body=e.parentNode.nextElementSibling;var content=body.textContent;var clipboard=navigator.clipboard;clipboard&&clipboard.writeText(content)})(event.target)">复制代码</span></div>` +
          `<code class="hljs code-block-body javascript">${highlight.highlight(str, {language: lang, ignoreIllegals:true}).value}</code ></pre>`
        );
      } catch (__) {}
    }
    return "";
  },
};

export const md = new Markdown(mdOptions);