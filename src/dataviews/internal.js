import { pageSchemas } from '../schemas';
import { getAPI } from 'obsidian-dataview';

const isLink = getAPI().value.isLink;

// NOTE: To access the full Dataview API you must pass the Dataview object as an argument.
//       Using `app.plugins.plugins.dataview.api` provides the DataviewAPI object instead
//       of the DataviewInlineAPI object.

/**
 * Show all inquiries with the same source key as the current entry.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showInquiryContentsTable(dv) {
  const entry = dv.current();
  const { error } = pageSchemas.inquiryPageSchema.validate(entry);
  if (error) dv.paragraph(`*Invalid inquiry page: ${error.message}*`);
  else {
    const type = entry.tags[0];
    const sourceKey = entry['source-key'];
    const records = dv
      .pages(type)
      .filter((page) => page['source-key'] === sourceKey)
      .sort((page) => page.file.name, 'asc')
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(page.parents?.length ? page.parents : null),
        dv.paragraph(page['source-link'] || null),
        dv.paragraph(page.done ? '`true`' : '`false`'),
      ]);
    if (records.length)
      dv.table(['**Inquiry**', '**Parents**', '**Source Link**', '**Done**'], records);
    else dv.span(`**No inquiries found under \`${sourceKey}\`**`);
  }
}

/**
 * Show all practice with the same source key as the current entry.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showPracticeContentsTable(dv) {
  const entry = dv.current();
  const { error } = pageSchemas.practicePageSchema.validate(entry);
  if (error) dv.paragraph(`*Invalid practice page: ${error.message}*`);
  else {
    const type = entry.tags[0];
    const sourceKey = entry['source-key'];
    const records = dv
      .pages(type)
      .filter((page) => page['source-key'] === sourceKey)
      .sort((page) => page.file.name, 'asc')
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(page.parents?.length ? page.parents : null),
        dv.paragraph(page['source-link'] || null),
        dv.paragraph(page['one-or-many'] ? `\`${page['one-or-many']}\`` : null),
        dv.paragraph(page.done ? '`true`' : '`false`'),
      ]);
    if (records.length)
      dv.table(
        ['**Practice**', '**Parents**', '**Source Link**', '**One-or-many**', '**Done**'],
        records,
      );
    else dv.span(`**No inquiries found under \`${sourceKey}\`**`);
  }
}

/**
 * Display descendant informal entries.
 * @param {object} dv - The Dataview object.
 * @returns {void}
 */
export function showDescendantInformals(dv) {
  const entry = dv.current();
  const type = entry.tags?.[0];
  const { error } = pageSchemas.informalPageSchema.validate(entry);
  if (type !== 'ℹ️' && error)
    dv.paragraph(
      `Invalid page: ${
        error.details.type === 'any.only' && type !== 'ℹ️'
          ? `\`tags\` should contain ℹ️, or ${error.message}`
          : `${error.message}`
      }`,
    );
  else {
    const records = dv
      .pages('#informal')
      .filter(
        (page) =>
          page.parents instanceof Array &&
          page.parents.some((value) => isLink(value) && value.path === entry.file.path),
      )
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page.parents),
        dv.paragraph(page['formal-id'] ? `\`${page['formal-id']}\`` : null),
        dv.paragraph(page.tags?.[1] || null),
      ]);
    if (records.length)
      dv.table(['**Informal**', '**Parents**', '**Formal ID**', '**Status**'], records);
    else dv.paragraph('*No descendant informals found.*');
  }
}

// TODO: Implement `showFormalDescendant` function.
/**
 * Display descendant formal entries.
 * @param {object} dv - The Dataview object.
 * @returns {void}
 */
export function showSiblingFormals(dv) {
  dv.span('*No descendant formal entries found.*');
}

/**
 * Display descendant thoughts entries.
 * @param {object} dv - The Dataview object.
 * @returns {void}
 */
export function showDescendantThoughts(dv) {
  const entry = dv.current();
  const { error } = pageSchemas.informalPageSchema.validate(entry);
  if (error) dv.paragraph(`*Invalid informal page: ${error.message}*`);
  else {
    const records = dv
      .pages('#thought')
      .filter(
        (page) =>
          page.parents instanceof Array &&
          page.parents.some((value) => isLink(value) && value.path === entry.file.path),
      )
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page.parents),
        dv.paragraph(page.tags?.[1] || null),
      ]);
    if (records.length) dv.table(['**Thought**', '**Parents**', '**Status**'], records);
    else dv.span('*No descendant thoughts found.*');
  }
}

/**
 * Display "top-level" list items under the "Comments and Questions" section of other
 * entries which also contain a link to the current entry.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showOtherCommentsAndQuestions(dv) {
  // NOTE: Unguardable edge case: if a "Comments and Questions" header isn't a top level
  //       heading or occurs more than once, then list items under it will show up.
  const currentFile = dv.current().file;
  const targetSection = 'Comments and Questions';
  const records = dv
    .pages(`[[${currentFile.name}]] AND !"${currentFile.path}"`)
    .flatMap(({ file: { aliases, name, lists } }) =>
      lists
        .filter(
          (listItem) =>
            !listItem.task &&
            listItem.section.subpath?.trim() === targetSection &&
            listItem.outlinks.some((link) => link.path === currentFile.name),
        )
        .map((listItem) => [
          listItem.text,
          dv.sectionLink(name, targetSection, false, aliases?.[0] || name),
        ]),
    );
  if (records.length) dv.table(['**Comment/Question**', '**Origin**'], records);
  else dv.span('*No external comments or questions found.*');
}

/**
 * Display "top-level" tasks under the "Tasks" section of other entries which also
 * contain a link to the current entry.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showOtherTasks(dv) {
  // NOTE: Unguardable edge case: if a "Tasks" header isn't a top level heading or occurs
  //       more than once, then list items under it will show up.
  const currentFile = dv.current().file;
  const targetSection = 'Tasks';
  const records = dv
    .pages(`[[${currentFile.name}]] AND !"${currentFile.path}"`)
    .flatMap(({ file: { aliases, name, lists } }) =>
      lists
        .filter(
          (listItem) =>
            listItem.task &&
            listItem.section.subpath?.trim() === targetSection &&
            listItem.outlinks.some((link) => link.path === currentFile.name),
        )
        .map((listItem) => [
          listItem.text,
          dv.sectionLink(name, targetSection, false, aliases?.[0] || name),
        ]),
    );
  if (records.length) dv.table(['**Task**', '**Origin**'], records);
  else dv.span('*No external tasks found.*');
}
