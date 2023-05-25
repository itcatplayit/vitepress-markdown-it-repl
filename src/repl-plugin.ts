import type MarkdownIt from 'markdown-it';

// set globalEnabledLineNumbers to equal with vitepress project's `markdown.lineNumbers`
const replPlugin: MarkdownIt.PluginSimple = (
  md,
  configs = { globalEnabledLineNumbers: false, symbol: '$' },
): void => {
  const fence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args);

    const [tokens, idx] = args;
    const info = tokens[idx].info;

    const isLineNumberActive =
      (configs.globalEnabledLineNumbers && !/:no-line-numbers/.test(info)) ||
      (!configs.globalEnabledLineNumbers && /:line-numbers/.test(info));

    const tar = info.match(/\$\(([\d-,]+)\)/);
    const nums = new Set();
    if (tar && tar[1]) {
      tar[1].split(',').forEach((n) => {
        if (n.includes('-')) {
          const aa = n.split('-');
          const first = +aa[0];
          const last = +aa[1];
          for (let i = first; i <= last; i++) {
            nums.add(i);
          }
        } else {
          nums.add(+n);
        }
      });
    }

    const code = rawCode.slice(
      rawCode.indexOf('<code>'),
      rawCode.indexOf('</code>'),
    );
    const lines = code.split('\n');
    /* eslint-disable-next-line */
    const lineNumbersCode = [...Array(lines.length)]
      .map(
        (_, index) =>
          `<span class="replin">${nums.has(index + 1) ? configs.symbol : ''}</span><br>`,
      )
      .join('');
    // line-numbers-wrapper class is to avoid add more css
    const lineNumbersWrapperCode = `
      <div
        class="line-numbers-wrapper replin-wrapper"
        style="width: 10px;border-right:none;left:${
          isLineNumberActive ? '40px' : '10px'
        }" 
        aria-hidden="true">
      ${lineNumbersCode}
      </div>
    `;
    const finalCode = rawCode.replace(
      /<\/div>$/,
      `${lineNumbersWrapperCode}</div>`,
    );

    return finalCode;
  };
};

export { replPlugin };
