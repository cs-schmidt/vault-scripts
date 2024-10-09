// NOTE: To access the full Dataview API you must pass the Dataview object as an argument.
//       Using `app.plugins.plugins.dataview.api` provides the DataviewAPI object instead
//       of the DataviewInlineAPI object.

// TODO: Display parents of entries in all queries.

/**
 * Display all inquiries with the same source key as the current entry.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showInquiryContentsTable(dv) {
  const entryType = dv.current().tags?.[0];
  const sourceKey = dv.current()['source-key'];
  if (entryType !== '#inquiry') dv.span('*Entry must be an `#inquiry`.*');
  else if (sourceKey === undefined) dv.span('*`source-key` is missing.*');
  else if (typeof sourceKey != 'string') dv.span('*`source-key` is not a string.*');
  else {
    const records = dv
      .pages('#inquiry')
      .filter((page) => page['source-key'] === sourceKey)
      .map((page) => [
        dv.fileLink(page.file.name),
        page.parents?.length ? page.parents : null,
        page['source-link'] || null,
        page.done,
      ]);
    if (records.length)
      dv.table(['**Inquiry**', '**Parents**', '**Source Link**', '**Done**'], records);
    else dv.span(`*No inquiries found under \`${sourceKey}\`.*`);
  }
}

/**
 * Display all practice with the same source key as the current entry.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showPracticeContentsTable(dv) {
  const entryType = dv.current().tags?.[0];
  const sourceKey = dv.current()['source-key'];
  if (entryType !== '#practice') dv.span('*Entry must be `#practice`.*');
  else if (sourceKey === undefined) dv.span('*`source-key` is missing.*');
  else if (typeof sourceKey != 'string') dv.span('*`source-key` is not a string.*');
  else {
    const records = dv
      .pages('#practice')
      .filter((page) => page['source-key'] === sourceKey)
      .map((page) => [
        dv.fileLink(page.file.name),
        page.parents?.length ? page.parents : null,
        page['source-link'] || null,
        page.done,
      ]);
    if (records.length)
      dv.table(['**Practice**', '**Parents**', '**Source Link**', '**Done**'], records);
    else dv.span(`*No practice found under \`${sourceKey}\`.*`);
  }
}

// TODO: Implement `showInformalDescendant` function.
/**
 * Display descendant informal entries.
 * @param {object} dv - The Dataview object.
 * @returns {void}
 */
export function showDescendantInformals(dv) {
  const entryName = dv.current().file.name;
  const entryType = dv.current().tags?.[0];
  if (entryType !== '#informal') dv.span('*Entry must be `#informal`.*');
  else {
    const records = dv
      .pages('#informal')
      .filter(({ parents }) =>
        parents?.some((link) => link?.path === `entries/${entryName}.md`),
      )
      .map((page) => [dv.fileLink(page.file.name), page.parents, page.tags?.[1]]);
    if (records.length) dv.table(['**Informal**', '**Parents**', '**Status**'], records);
    else dv.span('*No descendant informal entries found.*');
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

// TODO: Implement `showDescendantThoughts` function.
/**
 * Display descendant thoughts entries.
 * @param {object} dv - The Dataview object.
 * @returns {void}
 */
export function showDescendantThoughts(dv) {
  dv.span('*No descendant thoughts found.*');
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
