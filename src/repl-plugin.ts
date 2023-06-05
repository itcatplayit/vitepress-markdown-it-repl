import type MarkdownIt from 'markdown-it';

const defaultConfigs = {
  globalEnabledLineNumbers: false,
  symbol: '$',
  leftDelimiter: '$(',
  rightDelimiter: ')',
};

// set globalEnabledLineNumbers to equal with vitepress project's `markdown.lineNumbers`
const replPlugin: MarkdownIt.PluginSimple = (
  md,
  configs = defaultConfigs,
): void => {
  const fence = md.renderer.rules.fence!;

  const iConfigs = { ...defaultConfigs, ...configs };

  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args);

    const [tokens, idx] = args;
    const info = tokens[idx].info;
    let symbol = iConfigs.symbol;

    const isLineNumberActive =
      (iConfigs.globalEnabledLineNumbers && !/:no-line-numbers/.test(info)) ||
      (!iConfigs.globalEnabledLineNumbers && /:line-numbers/.test(info));

    const sreg =
      '\\' +
      iConfigs.leftDelimiter.split('').join('\\') +
      '([\\d-,]+)([^\s]{0,2})\\' +
      iConfigs.rightDelimiter.split('').join('\\');
    const reg = new RegExp(sreg);
    const tar = info.match(reg);
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
      if (tar[2]) {
        symbol = tar[2];
      }
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
          `<span class="replin">${
            nums.has(index + 1) ? symbol : ''
          }</span><br>`,
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
