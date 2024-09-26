import { PATH_TITLE_REGEX } from '../utils/constants.js';

// NOTE: To get access to the full Dataview API you must pass the Dataview object as an
//       argument. Accessing the API using `app.plugins.plugins.dataview.api` gives you
//       a "DataviewAPI" object instead of a "DataviewInlineAPI" object.

export default {
  displayUnresolvedInquiries,
  displayUnresolvedPractice,
  displayLogEntries,
  displayOtherCommentsAndQuestions,
  displayOtherTasks,
};

/**
 * Displays inquiries that aren't resolved: i.e., inquiries that aren't done or have an
 * inconsistency between their title and citation key.
 * @param {DataviewInlineApi} dv - Dataview's Inline API.
 * @returns {void}
 */
function displayUnresolvedInquiries(dv) {
  // FIXME: Ensure you await Templater startup templates and Dataview.
  const invalidRecords = [];
  const pendingRecords = [];
  dv.pages('#inquiry').forEach(extractRecordIfUnresolved);
  if (invalidRecords.length && pendingRecords.length) {
    dv.header(4, '**\\*Invalid Inquiries\\***');
    dv.table(['**Inquiry**', '**Error Message**'], invalidRecords);
    dv.header(4, 'Pending Inquiry');
    dv.table(['**Inquiry**', '**Citation Key**', '**Link**'], pendingRecords);
  } else if (invalidRecords.length) {
    dv.header(4, '**\\*Invalid Inquiries\\***');
    dv.table(['**Inquiry**', '**Error Message**'], invalidRecords);
  } else if (pendingRecords.length)
    dv.table(['**Inquiry**', '**Citation Key**', '**Link**'], pendingRecords);
  else dv.span('No unresolved inquiries found.');

  // Internal Helpers
  // *****************************************************************
  function extractRecordIfUnresolved(page) {
    const title = page.file.name;
    const citationKey = page['citation-key'];
    if (typeof citationKey === 'undefined') {
      invalidRecords.push([dv.fileLink(title), 'Missing citation-key property.']);
      return;
    }
    if (typeof citationKey !== 'string') {
      invalidRecords.push([dv.fileLink(title), "Citation key isn't a string."]);
      return;
    }
    const hasPathTitle = PATH_TITLE_REGEX.test(title);
    const hasCitationKeyPrefix = title.startsWith(citationKey);
    if (hasPathTitle && !hasCitationKeyPrefix)
      invalidRecords.push([
        dv.fileLink(title),
        'Path title and citation key mismatch.',
      ]);
    else if (!hasPathTitle && citationKey.length > 0)
      invalidRecords.push([
        dv.fileLink(title),
        'Nonpath title without empty citation key.',
      ]);
    else if (!page.done)
      pendingRecords.push([dv.fileLink(title), citationKey || null, page.link || null]);
  }
}

/**
 * Displays practice entries that aren't resolved: i.e., inquiries that aren't done or
 * have an inconsistency between their title and citation key.
 * @param {DataviewInlineApi} dv - Dataview's Inline API.
 * @returns {void}
 */
function displayUnresolvedPractice(dv) {
  // FIXME: Ensure you await Templater startup templates and Dataview.
  const invalidRecords = [];
  const pendingRecords = [];
  dv.pages('#practice').forEach(extractRecordIfUnresolved);
  if (invalidRecords.length && pendingRecords.length) {
    dv.header(4, '**\\*Invalid Practice Entries\\***');
    dv.table(['**Practice Entry**', '**Error Message**'], invalidRecords);
    dv.header(4, 'Pending Practice Entry');
    dv.table(['**Practice Entry**', '**Citation Key**', '**Link**'], pendingRecords);
  } else if (invalidRecords.length) {
    dv.header(4, '**\\*Invalid Practice Entries\\***');
    dv.table(['**Practice Entry**', '**Error Message**'], invalidRecords);
  } else if (pendingRecords.length)
    dv.table(['**Practice Entry**', '**Citation Key**', '**Link**'], pendingRecords);
  else dv.span('No unresolved practice entries found.');

  // Internal Helpers
  // *****************************************************************
  function extractRecordIfUnresolved(page) {
    const title = page.file.name;
    const type = page.type;
    if (typeof type == 'undefined') {
      invalidRecords.push([dv.fileLink(title), 'Missing type property.']);
      return;
    }
    if (!['one', 'many'].includes(type)) {
      invalidRecords.push([dv.fileLink(title), 'Type value must be "one" or "many"']);
      return;
    }
    const citationKey = page['citation-key'];
    if (typeof citationKey === 'undefined') {
      invalidRecords.push([dv.fileLink(title), 'Missing citation-key property.']);
      return;
    }
    if (typeof citationKey !== 'string') {
      invalidRecords.push([dv.fileLink(title), "Citation key isn't a string."]);
      return;
    }
    const hasPathTitle = PATH_TITLE_REGEX.test(title);
    const hasCitationKeyPrefix = title.startsWith(citationKey);
    if (hasPathTitle && !hasCitationKeyPrefix)
      invalidRecords.push([
        dv.fileLink(title),
        'Path title and citation key mismatch.',
      ]);
    else if (!hasPathTitle && citationKey.length > 0)
      invalidRecords.push([
        dv.fileLink(title),
        'Nonpath title without empty citation key.',
      ]);
    else if (!page.done)
      pendingRecords.push([dv.fileLink(title), citationKey || null, page.link || null]);
  }
}

/**
 * Fetches logs, sorting results in descending order (from most to least recent).
 * @param {DataviewInlineApi} dv - Dataview's Inline API.
 * @param {number} limit - The maximum number of log entries displayed.
 * @returns {void}
 */
function displayLogEntries(dv, limit = 15) {
  const results = dv
    .pages('#log')
    .sort((page) => page.date, 'desc')
    .limit(limit)
    .map((page) => {
      const entryTitle = page.aliases?.[0]
        ? dv.fileLink(page.file.name, false, page.aliases[0])
        : dv.fileLink(page.file.name);
      return [entryTitle, page.date];
    });
  if (results.length) dv.table(['Log', 'Date'], results);
  else dv.span('No logs found.');
}

/**
 * Displays "top-level" list items under the "Comments and Questions" heading of other
 * entries which contain a link to the current entry.
 * @param {DataviewInlineApi} dv - Dataview's Inline API.
 * @returns {void}
 */
function displayOtherCommentsAndQuestions(dv) {
  // NOTE: There's an edge case I can't guard: if a "Comments and Questions" header
  //       isn't a top level heading or appears more than once, then list items
  //       underneath can still show up.
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
  if (records.length) dv.table(['**Comment/Question**', '**Source Note**'], records);
  else dv.span('No external comments or questions found.');
}

/**
 * Displays "top-level" tasks under the "Tasks" heading of other entries which contain a
 * link to the current entry.
 * @param {DataviewInlineApi} dv - Dataview's Inline API.
 * @returns {void}
 */
function displayOtherTasks(dv) {
  // NOTE: There's an edge case I can't guard: if a "Tasks" header isn't a top level
  //       heading or appears more than once, then tasks underneath can still show up.
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
  if (records.length) dv.table(['**Task**', '**Source Note**'], records);
  else dv.span('No external tasks found.');
}

// /**
//  * Fetches all underdeveloped knowledge entries: they have a quality status o
//  * 🌱 or less.
//  * @param {Object} dv - The Dataview object.
//  * @returns {void}
//  */
// function fetchUnderdevelopedKnowledge(dv) {
//   const entryTypes = new Set(['#common', '#formal', '#thought']);
//   const qualities = { '🌰': 0, '🌱': 1, '🌿': 2, '🌲': 3 };
//   const results = dv
//     .pages(Array.from(entryTypes).join(' OR '))
//     .where(({ tags }) => !tags.some((tag) => /^\s*[🌿🌲]\s$/.test(tag)))
//     .map(({ file, aliases, tags }) => [
//       dv.fileLink(file.name, false, aliases?.[0]),
//       tags.find((tag) => entryTypes.has(tag)),
//       tags.find((tag) => tag in qualities),
//     ])
//     .sort(
//       (dataItem) => qualities[dataItem.find((tag) => tag in qualities)],
//       null,
//       (qualityValA, qualityValB) => {
//         if (qualityValA < qualityValB) return 1;
//         if (qualityValA > qualityValB) return -1;
//         return 0;
//       }
//     );
//   if (results.length) dv.table(['Entry', 'Type', 'Status'], results);
//   else dv.span('No underdeveloped knowledge entries found.');
// }
