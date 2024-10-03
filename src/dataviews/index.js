import { isValidSourceKey, parseSourceKey, isValidFormalID } from '../utils/templates.js';

// NOTE: To get access to the full Dataview API you must pass the Dataview object as an
//       argument. Accessing the API using `app.plugins.plugins.dataview.api` gives you
//       the "DataviewAPI" object instead of the "DataviewInlineAPI" object.

// TODO: In all unresolved type queries, make sure parents are informal types only.
// TODO: Display parents of entries in all queries.

/**
 * Display unresolved inquiries: they aren't done or have a source key error.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedInquiries(dv) {
  const invalidRecords = [];
  const pendingRecords = [];
  dv.pages('#inquiry').forEach(attachToRecordList);
  if (invalidRecords.length && pendingRecords.length) {
    dv.header(4, '**\\*Invalid Inquiries\\***');
    dv.table(['**Inquiry**', '**Error Message**'], invalidRecords);
    dv.header(4, '**Pending Inquiries**');
    dv.table(['**Inquiry**', '**Source Key**', '**Link**'], pendingRecords);
  } else if (invalidRecords.length) {
    dv.header(4, '**\\*Invalid Inquiries\\***');
    dv.table(['**Inquiry**', '**Error Message**'], invalidRecords);
  } else if (pendingRecords.length)
    dv.table(['**Inquiry**', '**Source Key**', '**Link**'], pendingRecords);
  else dv.span('*No unresolved inquiries found.*');

  // *****************************************************************
  function attachToRecordList(page) {
    const title = page.file.name;
    const sourceKey = page['source-key'];
    if (sourceKey === undefined)
      invalidRecords.push([dv.fileLink(title), '`source-key` is missing.']);
    else if (typeof sourceKey != 'string')
      invalidRecords.push([dv.fileLink(title), '`source-key` is not a string.']);
    else if (!isValidSourceKey(sourceKey))
      invalidRecords.push([dv.fileLink(title), '`source-key` is invalid.']);
    else if (parseSourceKey(title) != sourceKey)
      invalidRecords.push([dv.fileLink(title), '`source-key` mismatch.']);
    else if (!page.done)
      pendingRecords.push([
        dv.fileLink(title),
        `\`${sourceKey}\`` || null,
        page.link || null,
      ]);
  }
}

/**
 * Display unresolved practice entries: they aren't done, have a missing type, or have an
 * inconsistency between their title and source key.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedPractice(dv) {
  const invalidRecords = [];
  const pendingRecords = [];
  dv.pages('#practice').forEach(attachToRecordList);
  if (invalidRecords.length && pendingRecords.length) {
    dv.header(4, '**\\*Invalid Practice\\***');
    dv.table(['**Practice**', '**Error Message**'], invalidRecords);
    dv.header(4, '**Pending Practice**');
    dv.table(['**Practice**', '**Source Key**', '**Link**', '**Type**'], pendingRecords);
  } else if (invalidRecords.length) {
    dv.header(4, '**\\*Invalid Practice\\***');
    dv.table(['**Practice**', '**Error Message**'], invalidRecords);
  } else if (pendingRecords.length)
    dv.table(['**Practice**', '**Source Key**', '**Link**', '**Type**'], pendingRecords);
  else dv.span('*No unresolved practice entries found.*');

  // *****************************************************************
  function attachToRecordList(page) {
    const title = page.file.name;
    const type = page.type;
    const sourceKey = page['source-key'];
    if (type === undefined)
      invalidRecords.push([dv.fileLink(title), '`type` is missing.']);
    else if (!['one', 'many'].includes(type))
      invalidRecords.push([dv.fileLink(title), '`type` must be "one" or "many"']);
    else if (sourceKey === undefined)
      invalidRecords.push([dv.fileLink(title), '`source-key` is missing.']);
    else if (typeof sourceKey != 'string')
      invalidRecords.push([dv.fileLink(title), '`source-key` is not a string.']);
    else if (!isValidSourceKey(sourceKey))
      invalidRecords.push([dv.fileLink(title), '`source-key` is invalid.']);
    else if (parseSourceKey(title) != sourceKey)
      invalidRecords.push([dv.fileLink(title), '`source-key` mismatch.']);
    else if (!page.done)
      pendingRecords.push([
        dv.fileLink(title),
        `\`${sourceKey}\`` || null,
        page.link || null,
        type,
      ]);
  }
}

/**
 * Display unresolved informal entries: they have an invalid status or formal ID.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedInformals(dv) {
  const invalidRecords = [];
  const pendingRecords = [];
  console.log(invalidRecords);
  console.log(pendingRecords);
  dv.pages('#informal').forEach(attachToRecordList);
  if (invalidRecords.length && pendingRecords.length) {
    dv.header(4, '**\\*Invalid Informals\\***');
    dv.table(['**Informal**', '**Error Message**'], invalidRecords);
    dv.header(4, '**Pending Informals**');
    dv.table(['**Informal**', '**Formal ID**', '**Status**'], pendingRecords);
  } else if (invalidRecords.length) {
    dv.header(4, '**\\*Invalid Informals\\***');
    dv.table(['**Informal**', '**Error Message**'], invalidRecords);
  } else if (pendingRecords.length) {
    dv.header(4, '**Pending Informals**');
    dv.table(['**Informal**', '**Formal ID**', '**Status**'], pendingRecords);
  } else dv.span('*No unresolved informal entries found.*');

  // *****************************************************************
  function attachToRecordList(page) {
    const title = page.file.name;
    const status = page.tags?.[1];
    const formalID = page['formal-id'];
    if (status === undefined)
      invalidRecords.push([dv.fileLink(title), '`status` is missing.']);
    else if (!['🌰', '🌱', '🌿', '🌲'].includes(status))
      invalidRecords.push([dv.fileLink(title), '`status` is invalid.']);
    else if (formalID === undefined)
      invalidRecords.push([dv.fileLink(title), '`formal-id` should be included.']);
    else if (typeof formalID != 'string')
      invalidRecords.push([dv.fileLink(title), '`formal-id` is not a string.']);
    else if (!isValidFormalID(formalID))
      invalidRecords.push([dv.fileLink(title), '`formal-id` is invalid.']);
    else if (['🌰', '🌱'].includes(status))
      pendingRecords.push([dv.fileLink(title), formalID || null, status]);
  }
}

// TODO: Implement `showUnresolvedFormals` function.
/**
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedFormals(dv) {
  dv.span('*No unresolved formal entries found.*');
}

/**
 * Display unresolved thoughts: i.e., those with an invalid status.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedThoughts(dv) {
  const invalidRecords = [];
  const pendingRecords = [];
  dv.pages('#thought').forEach(attachToRecordList);
  if (invalidRecords.length && pendingRecords.length) {
    dv.header(4, '**\\*Invalid Thoughts\\***');
    dv.table(['**Thought**', '**Error Message**'], invalidRecords);
    dv.header(4, '**Pending Thoughts**');
    dv.table(['**Thought**', '**Status**'], pendingRecords);
  } else if (invalidRecords.length) {
    dv.header(4, '**\\*Invalid Thoughts\\***');
    dv.table(['**Thought**', '**Error Message**'], invalidRecords);
  } else if (pendingRecords.length) {
    dv.header(4, '**Pending Thoughts**');
    dv.table(['**Thought**', '**Status**'], pendingRecords);
  } else dv.span('*No unresolved thoughts found.*');

  // *****************************************************************
  function attachToRecordList(page) {
    const title = page.file.name;
    const status = page.tags?.[1];
    if (status === undefined)
      invalidRecords.push([dv.fileLink(title), '`status` is missing.']);
    else if (!['🌰', '🌱', '🌿', '🌲'].includes(status))
      invalidRecords.push([dv.fileLink(title), '`status` is invalid.']);
    else if (['🌰', '🌱'].includes(status))
      pendingRecords.push([dv.fileLink(title), status]);
  }
}

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
  if (entryType !== '#practice') dv.span('*Entry must be an `#practice`.*');
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

/**
 * Display logs in descending order (from most recent to least).
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @param {number|undefined} limit - Max number of log entries shown.
 * @returns {void}
 */
export function showLogs(dv, limit) {
  const records = dv
    .pages('#log')
    .sort(({ date }) => date, 'desc')
    .limit(limit)
    .map((page) => {
      const filename = page.file.name;
      const title = page.aliases?.[0] || filename;
      return [dv.fileLink(filename, false, title), page.date];
    });
  if (records.length) dv.table(['Log', 'Date'], records);
  else dv.span('*No logs found.*');
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
            listItem.outlinks.some((link) => link.path === currentFile.name)
        )
        .map((listItem) => [
          listItem.text,
          dv.sectionLink(name, targetSection, false, aliases?.[0] || name),
        ])
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
            listItem.outlinks.some((link) => link.path === currentFile.name)
        )
        .map((listItem) => [
          listItem.text,
          dv.sectionLink(name, targetSection, false, aliases?.[0] || name),
        ])
    );
  if (records.length) dv.table(['**Task**', '**Origin**'], records);
  else dv.span('*No external tasks found.*');
}
