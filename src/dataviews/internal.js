import { pageSchemas } from '../schemas';

// NOTE: To access the full Dataview API you must pass the Dataview object as an argument.
//       Using `app.plugins.plugins.dataview.api` provides the DataviewAPI object instead
//       of the DataviewInlineAPI object.

/**
 * Show all sibling inquiries.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export async function showSiblingInquiries(dv) {
  const note = dv.current();
  const { error } = pageSchemas.inquiryPageSchema.validate(note);
  if (error) dv.paragraph(`*Invalid inquiry: ${error.message}*`);
  else {
    const records = dv
      .pages('#inquiry')
      .where(
        (page) =>
          !pageSchemas.inquiryPageSchema.validate(page).error &&
          page['source-key'] === note['source-key'],
      )
      .sortInPlace((page) => page.file.name, 'asc')
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(page.parents.length ? page.parents : null),
        dv.paragraph(page['source-link'] || null),
        dv.paragraph(page.done ? '`true`' : '`false`'),
      ]);
    if (records.length) dv.table(['Inquiry', 'Parents', 'Source Link', 'Done'], records);
    else dv.paragraph(`*No inquiries found under \`${note['source-key']}\`*`);
  }
}

/**
 * Show all sibling practice.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showSiblingPractice(dv) {
  const note = dv.current();
  const { error } = pageSchemas.practicePageSchema.validate(note);
  if (error) dv.paragraph(`*Invalid practice: ${error.message}*`);
  else {
    const records = dv
      .pages('#practice')
      .where(
        (page) =>
          !pageSchemas.practicePageSchema.validate(page).error &&
          page['source-key'] === note['source-key'],
      )
      .sortInPlace((page) => page.file.name, 'asc')
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(page.parents.length ? page.parents : null),
        dv.paragraph(page['source-link'] || null),
        dv.paragraph(`\`${page['one-or-many']}\``),
        dv.paragraph(page.done ? '`true`' : '`false`'),
      ]);
    if (records.length)
      dv.table(['Practice', 'Parents', 'Source Link', 'One-or-many', 'Done'], records);
    else dv.paragraph(`*No practice found under \`${note['source-key']}\`*`);
  }
}

/**
 * Shows all sibling formals.
 * @param {object} dv The Dataview object.
 * @returns {void}
 */
export function showSiblingFormals(dv) {
  const note = dv.current();
  const { error } = pageSchemas.formalPageSchema.validate(note);
  if (error) dv.paragraph(`*Invalid formal: ${error.message}*`);
  else if (!note.parents.length) dv.paragraph('*No sibling formals found.*');
  else {
    const records = dv
      .pages('#formal')
      .where((page) => {
        if (pageSchemas.formalPageSchema.validate(page).error) return false;
        const parentPaths = new Set(page.parents.map((link) => link.path));
        return (
          note.parents.length == parentPaths.size &&
          note.parents.every((link) => parentPaths.has(link.path))
        );
      })
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(`\`${page.type}\``),
        dv.paragraph(page.tags[1]),
      ]);
    if (records.length) dv.table(['Formal', 'Type', 'Status'], records);
    else dv.paragraph('*No sibling formals found.*');
  }
}

/**
 * Shows descendant informals.
 * @param {object} dv The Dataview object.
 * @returns {void}
 */
export function showDescendantInformals(dv) {
  const note = dv.current();
  const type = note.tags?.[0];
  const { error } = pageSchemas.informalPageSchema.validate(note);
  if (type !== 'ℹ️' && error)
    dv.paragraph(
      `*Invalid page: ${
        error.details.type === 'any.only' && type !== 'ℹ️'
          ? `\`tags\` should contain ℹ️, or ${error.message}`
          : `${error.message}`
      }*`,
    );
  else {
    const records = dv
      .pages('#informal')
      .where(
        (page) =>
          !pageSchemas.informalPageSchema.validate(page).error &&
          page.parents.some((link) => link.path === note.file.path),
      )
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page.parents),
        dv.paragraph(page['formal-id'] ? `\`${page['formal-id']}\`` : null),
        dv.paragraph(page.tags[1]),
      ]);
    if (records.length) dv.table(['Informal', 'Parents', 'Formal ID', 'Status'], records);
    else dv.paragraph('*No descendant informals found.*');
  }
}

/**
 * Shows all descendant formals.
 * @param {object} dv The Dataview object.
 * @returns {void}
 */
export function showDescendantFormals(dv) {
  const note = dv.current();
  const { error } = pageSchemas.informalPageSchema.validate(note);
  if (error) dv.paragraph(`*Invalid informal: ${error.message}*`);
  else {
    const records = dv
      .pages('#formal')
      .where(
        (page) =>
          !pageSchemas.formalPageSchema.validate(page).error &&
          page.parents.some((link) => link.path === note.file.path),
      )
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page.parents),
        dv.paragraph(`\`${page.type}\``),
        dv.paragraph(page.tags[1]),
      ]);
    if (records.length) dv.table(['Formal', 'Parents', 'Type', 'Status'], records);
    else dv.paragraph('*No descendant formals found.*');
  }
}

/**
 * Shows all descendant thoughts.
 * @param {object} dv The Dataview object.
 * @returns {void}
 */
export function showDescendantThoughts(dv) {
  const note = dv.current();
  const { error } = pageSchemas.informalPageSchema.validate(note);
  if (error) dv.paragraph(`*Invalid informal: ${error.message}*`);
  else {
    const records = dv
      .pages('#thought')
      .where(
        (page) =>
          !pageSchemas.thoughtPageSchema.validate(page).error &&
          page.parents.some((link) => link.path === note.file.path),
      )
      .map((page) => [
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page.parents),
        dv.paragraph(page.tags[1]),
      ]);
    if (records.length) dv.table(['Thought', 'Parents', 'Status'], records);
    else dv.paragraph('*No descendant thoughts found.*');
  }
}

/**
 * Shows "top-level" list items under the "Comments and Questions" section of other
 * entries which also contain a link to the current entry.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showOuterCommentsAndQuestions(dv) {
  // NOTE: Unguardable edge case: if a "Comments and Questions" header isn't a top level
  //       heading or occurs more than once, then list items under it will show up.
  const file = dv.current().file;
  const section = 'Comments and Questions';
  const records = dv.pages(`[[${file.name}]] AND !"${file.path}"`).flatMap((page) => {
    const name = page.file.name;
    const alias = page.file.aliases?.[0];
    const list = page.file.lists;
    return list
      .where(
        (listItem) =>
          !listItem.task &&
          listItem.section.subpath.trim() == section &&
          listItem.outlinks.some((link) => link.path == file.name),
      )
      .map(({ text }) => [text, dv.sectionLink(name, section, false, alias || name)]);
  });
  if (records.length) dv.table(['Comment/Question', 'Origin'], records);
  else dv.paragraph('*No outer comments or questions found.*');
}

/**
 * Shows "top-level" tasks under the "Tasks" section of other entries which also contain a
 * link to the current entry.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showOuterTasks(dv) {
  // NOTE: Unguardable edge case: if a "Tasks" header isn't a top level heading or occurs
  //       more than once, then list items under it will show up.
  const file = dv.current().file;
  const section = 'Tasks';
  const records = dv.pages(`[[${file.name}]] AND !"${file.path}"`).flatMap((page) => {
    const name = page.file.name;
    const alias = page.file.aliases?.[0];
    const list = page.file.lists;
    return list
      .where(
        (listItem) =>
          listItem.task &&
          listItem.section.subpath.trim() == section &&
          listItem.outlinks.some((link) => link.path == file.name),
      )
      .map(({ text }) => [text, dv.sectionLink(name, section, false, alias || name)]);
  });
  if (records.length) dv.table(['Task', 'Origin'], records);
  else dv.paragraph('*No outer tasks found.*');
}
