import CodeMirror from 'codemirror';
//import * as SharedFormulaCompiler from '../../../formula-compiler/index';
//import { FixCodeMirrorEditor, MarkField } from '../type';

export type MarkOption = {
  from: number;
  to: number;
  field: any;//SharedFormulaCompiler.Formula.Field;
  invalid: boolean; // 是否是有效字段
};

export type ReplaceOptions = {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
};

export const formulaType = 'text/fx-formula';

export function randomKey(len: number) {
  let str = '';
  const range = len;
  const arr = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

// 解析编辑文本中的字段
export function parseEditorText(
  editorText: string,
  fields: Record<string, any>) {
  // const markRegEep = /(?<match><(?<mark>[^\s>]+)[^>]*>(?<id>.*?)<\/\k<mark>>)/g;
  const markRegEep = /(?<match>{{(?<id>.*?)}})/g;
  let exec: RegExpExecArray | null;
  let text = '';
  const marks: MarkOption[] = [];
  let pos = 0, last = 0

  while ((exec = markRegEep.exec(editorText))) {
    // @ts-ignore
    const { groups: { id, match }, index } = exec;
    if(index > last) {
      text += editorText.substring(last, index)
    }
    pos = index
    last = pos + match.length

    let field: any = fields[id];
    const invalid = !field;
    if (invalid) {
      field = {
        id,
        name: '已失效',
        fieldType: 'ANY',
      };
    }
    const fromIndex = text.length;
    text = `${text} ${field.name} `;
    const toIndex = text.length;
    const markOption: MarkOption = {
      from: fromIndex,
      to: toIndex,
      field,
      invalid,
    };
    marks.push(markOption);
  }
  return { text, marks };
}

export function parseFormulaFromEditorText(editorText: string, editorMark: string) {
  const markRegEep = new RegExp(`(?<match><${editorMark}[^>]*>(?<id>.*?)<\\/${editorMark}>)`, 'g');
  let exec: RegExpExecArray | null;
  let sourcePos = 0;
  const _editorText = editorText.replace(/[\r]?\n/g, '');

  let formula = '';
  while ((exec = markRegEep.exec(_editorText))) {
    // @ts-ignore
    const { groups: { id, match }, index } = exec;
    formula = formula + `${_editorText.slice(sourcePos, index)}{${id}}`;
    sourcePos = index + match.length;
  }
  if (sourcePos !== _editorText.length) {
    formula += _editorText.slice(sourcePos, _editorText.length);
  }
  return formula;
}

// 插入字段
export function insertField(cm: any,
  field: any,
  replaceOptions?: ReplaceOptions) {
  const code = ` ${field.name} `;
  if (replaceOptions) {
    // @ts-ignore
    cm.replaceRange('', replaceOptions.from, replaceOptions.to, 'complete');
  } else {
    // @ts-ignore
    const selections = cm.listSelections() || [];
    const [range] = selections;
    if (range && !range.empty()) {
      // @ts-ignore
      cm.replaceRange('', range.from(), range.to(), 'complete');
    }
  }

  // @ts-ignore
  const from = cm.getCursor();
  // @ts-ignore
  cm.replaceSelection(code, 'end');
  // @ts-ignore
  const to = cm.getCursor();
  markFieldMarker(cm, { from, to, field, invalid: false });
  // @ts-ignore
  cm.refresh();
}

export function insertIdentifier(cm: any,
  tokenInfo: any, replaceOptions?: ReplaceOptions) {
  const isFunc = tokenInfo.type === 'FUNC';
  const isParametricFunc = isFunc &&
    !(tokenInfo as any).parameterless;
  const code = isFunc ? `${tokenInfo.name}()` : `${tokenInfo.name} `;
  if (replaceOptions) {
    // @ts-ignore
    cm.replaceRange(code, replaceOptions.from, replaceOptions.to, 'complete');
    // @ts-ignore
    const cur = cm.getCursor();
    // @ts-ignore
    cm.setCursor({
      line: cur.line,
      ch: isParametricFunc ? cur.ch - 1 : cur.ch,
    });
  } else {
    // @ts-ignore
    const cur = cm.getCursor();
    // @ts-ignore
    cm.replaceSelection(code);
    // @ts-ignore
    cm.setCursor({
      line: cur.line,
      ch: isParametricFunc ? cur.ch + code.length - 1 : cur.ch + code.length,
    });
  }
  // @ts-ignore
  cm.refresh();
}

export function insertEditorText(cm: any,
  editorText: string,
  fields: Record<string, any>,
  isOverlay?: boolean,
) {
  const lines = editorText.split(/[\r]?\n/);
  const texts: any[] = [];
  const marks: any[] = [];

  if (isOverlay) {
    lines.forEach((line, index) => {
      const { text, marks: _marks } = parseEditorText(line, fields);

      texts.push(text);
      marks.push(..._marks.map(mark => {
        const fromPos = CodeMirror.Pos(index, mark.from);
        const toPos = CodeMirror.Pos(index, mark.to);
        return {
          from: fromPos,
          to: toPos,
          field: mark.field,
          invalid: mark.invalid,
        };
      }));
    });
  } else {
    // @ts-ignore
    cm.replaceSelection('');
    // @ts-ignore
    const cur = cm.getCursor();
    const { line: curLine, ch: curCh } = cur;
    lines.forEach((line, index) => {
      const { text, marks: _marks } = parseEditorText(line, fields);
      texts.push(text);
      const lineNum = curLine + index;
      marks.push(..._marks.map(mark => {
        const fromIndex = lineNum === curLine ? mark.from + curCh : mark.from;
        const toIndex = lineNum === curLine ? mark.to + curCh : mark.to;
        const fromPos = CodeMirror.Pos(lineNum, fromIndex);
        const toPos = CodeMirror.Pos(lineNum, toIndex);
        return {
          from: fromPos,
          to: toPos,
          field: mark.field,
          invalid: mark.invalid,
        };
      }));
    });
  }
  // @ts-ignore
  isOverlay ? cm.setValue(texts.join('\n')) : cm.replaceSelection(texts.join('\n'), 'end');
  marks.forEach((markField: any) => {
    markFieldMarker(cm, markField);
  });
  // @ts-ignore
  cm.refresh();
}

//
export function markFieldMarker(cm: any, markField: any): void {
  const nameSpan = document.createElement('span');
  nameSpan.classList.add('cm-field-name');
  const label = markField.field.name || '暂无名称';
  nameSpan.innerHTML = `<em class="cm-field-symbol"> </em>${label
    }<em class="cm-field-symbol"> </em>`;
  // @ts-ignore
  const textMarker: any = cm.markText(markField.from, markField.to, {
    handleMouseEvents: true,
    atomic: true,
    replacedWith: nameSpan,
  });
  const widgetNode = textMarker.widgetNode;
  if (widgetNode) {
    // if (markField.field.color) {
    //   span.style.color = markField.field.color;
    // }
    // if (markField.field.bgColor) {
    //   span.style.backgroundColor = markField.field.bgColor;
    // }
    const cls = ['cm-m-formula', 'cm-field', `cm-${markField.field.fieldType}`];
    if (markField.invalid) {
      cls.push('cm-field-invalid');
    }
    widgetNode.classList.add(...cls);
    widgetNode.setAttribute('title', label);
    textMarker.__MARK_FIELD__ = markField;
    textMarker.__IS_FIELD__ = true;
    widgetNode.__TEXTMARKER__ = textMarker;
  }
}

export type MarkedSpan = {

  marker: CodeMirror.TextMarker & {
    __IS_FIELD__: boolean;
    __MARK_FIELD__: any;
  };

  from: number;
  to: number;
};

export function getSelectionText(cm: any, editorMark: string) {
  // @ts-ignore
  if (!cm.somethingSelected()) {
    return '';
  }
  // @ts-ignore
  const selections = cm.listSelections() || [];
  const [range] = selections; // 仅支持单光标
  if (!range || range.empty()) {
    return '';
  }
  const startPos = range.from();
  const endPos = range.to();
  const { line: startLine, ch: startCh } = startPos;
  const { line: endLine, ch: endCh } = endPos;
  const selectTexts: any[] = [];
  for (let line = startLine; line <= endLine; line++) {
    // @ts-ignore
    const lineHandle = cm.getLineHandle(line);
    const lineText = lineHandle.text;
    // @ts-ignore codemirror定义不完整
    const markedSpans: MarkedSpan[] = (lineHandle.markedSpans || [])
      // 过滤出字段marker
      .filter((markedSpan:any) => !!markedSpan.marker && markedSpan.marker.__IS_FIELD__);
    const markedStartIndex = markedSpans.map(markedSpan => markedSpan.from);
    const start = line === startLine ? startCh : 0;
    const end = line === endLine ? endCh : lineText.length;
    let selectText = '';
    // for (let index = start; index < end; index++) {
    let index = start;
    for (; index < end; index++) {
      if (markedStartIndex.includes(index)) {
        const markedSpan: any = markedSpans.find(_markedSpan => _markedSpan.from === index);
        const markField = markedSpan.marker.__MARK_FIELD__;
        selectText = selectText + `<${editorMark}>${markField.field.id}</${editorMark}>`;
        index = markedSpan.to - 1;
      } else {
        selectText = selectText + lineText.slice(index, index + 1);
      }
    }
    if (selectText) {
      selectTexts.push(selectText);
    }
  }
  return selectTexts.join('\n');
}

export function copy(cm: any, evt: any, options: {
  editorMark: string;
  copyType?: string;
}) {
  const { editorMark, copyType = formulaType } = options;
  const copyText = getSelectionText(cm, editorMark);
  const clipboardData = evt.clipboardData;
  const copyData = { copyText, editorMark };
  clipboardData.setData(copyType, JSON.stringify(copyData));
}

export function paste(cm: any, evt: any, options: {
  editorMark: string;
  fields: Record<string, any>;
  copyType?: string;
}) {
  const clipboardData = evt.clipboardData;
  const { editorMark, fields = {}, copyType = formulaType } = options;
  const copyDataJson = clipboardData.getData(copyType);
  if (!copyDataJson) {
    return;
  }
  try {
    const copyData = JSON.parse(copyDataJson);
    let { copyText, editorMark: _editorMark } = copyData;
    if (_editorMark !== editorMark) {
      const markRegEep = new RegExp(`(?<match><${_editorMark}[^>]*>(?<id>.*?)<\\/${_editorMark}>)`, 'g');
      copyText = copyText.replace(markRegEep, (...arg: any[]) => {
        const [groups] = arg.reverse();
        const { id } = groups;
        return `<${editorMark}>${id}</${editorMark}>`;
      });
    }
    insertEditorText(cm, copyText, fields);
  } catch (e) {
    console.error(e);
  }
}

/**
 * 获取函数名称
 */
export function getActiveFuncName(cm: any) {
  // @ts-ignore
  const cur: CodeMirror.Position = cm.getCursor();
  // @ts-ignore
  const formula = cm.getValue().replace(/[\r]?\n/g, '');
  if (!formula) {
    return '';
  }
  // @ts-ignore
  const lineToken = cm.getLineTokens(cur.line);
  if (!lineToken || !lineToken.length) {
    return '';
  }
  const _lineToken = lineToken.filter((token:any) =>
    token.type === 'func' && token.end > cur.ch && token.start < cur.ch);
  if (_lineToken.length) {
    return _lineToken[0].string;
  }

  const leftPart = formula.slice(0, cur.ch).split('').reverse().join('');
  const leftRegExp = /^[(]?[\s]*(?<func>[a-zA-Z]+)/;

  const leftMatch = leftPart.match(leftRegExp);
  if (leftMatch && leftMatch.groups) {
    const func = leftMatch.groups.func || '';
    if (func) {
      return func.split('').reverse().join('');
    }
  }
  const rightPart = formula.slice(cur.ch);
  const rightRegExp = /(?<func>[a-zA-Z]+)[\s]*[(]?/;

  const rightMatch = rightPart.match(rightRegExp);
  if (rightMatch && rightMatch.groups) {
    return rightMatch.groups.func || '';
  }
  return '';
}

export function getEditorValue(cm: any, isLabel: boolean = false) {
  // lineCount() insertEditorText 合并
  // @ts-ignore
  const lineCount = cm.lineCount();
  const texts: any[] = [];
  for (let lineNum = 0; lineNum < lineCount; lineNum++) {
    // @ts-ignore
    const lineHandle = cm.getLineHandle(lineNum);
    const lineText = lineHandle.text;
    // @ts-ignore codemirror定义不完整
    const markedSpans: MarkedSpan[] = (lineHandle.markedSpans || [])
      // 过滤出字段marker
      .filter((markedSpan:any) => !!markedSpan.marker && markedSpan.marker.__IS_FIELD__);
    const markedStartIndex = markedSpans.map(markedSpan => markedSpan.from);
    let start = 0;
    const end = lineText.length;
    let text = '';
    // for(let index = start; index < end; index++)
    for (; start < end; start++) {
      if (markedStartIndex.includes(start)) {
        const markedSpan: any = markedSpans.find(_markedSpan => _markedSpan.from === start);
        const markField = markedSpan.marker.__MARK_FIELD__;
        text = text + (!isLabel ? `{{${markField.field.id}}}` : `{${markField.field.name}}`);
        start = markedSpan.to - 1;
      } else {
        text = text + lineText.slice(start, start + 1);
      }
    }
    if (text) {
      texts.push(text);
    }
  }
  return texts.join('\n');
}
