import { pageSchemas } from '../schemas';
import { getAPI } from 'obsidian-dataview';
import { isEmpty } from 'lodash-es';
import { PROVABLE_FORMAL_TYPES, UNPROVABLE_FORMAL_TYPES } from '../utils/constants';

// NOTE: To access the full Dataview API you must pass the Dataview object as an argument.
//       Using `app.plugins.plugins.dataview.api` provides the DataviewAPI object instead
//       of the DataviewInlineAPI object.

const provables = new Set(PROVABLE_FORMAL_TYPES);
const unprovables = new Set(UNPROVABLE_FORMAL_TYPES);
const DateTime = getAPI().luxon.DateTime;

/**
 * Show unresolved inquiries: they have invalid metadata or are not done.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedInquiries(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#inquiry').forEach((page) => {
    const { error } = pageSchemas.inquiryPageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(error.message),
      ]);
    else if (!page.done)
      pendings.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(page['source-key'] ? `\`${page['source-key']}\`` : null),
        dv.paragraph(page['source-link'] || null),
      ]);
  });
  const invalidHeaders = ['Inquiry', 'Error'];
  const pendingHeaders = ['Inquiry', 'Source Key', 'Source Link'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved inquiries found.*');
}

/**
 * Show unresolved informals and formals: they have invalid metadata or are
 * underdeveloped.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showAllUnresolvedConcepts(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#informal OR #formal').forEach((page) => {
    const isInformal = page.tags[0] === '#informal';
    const type = isInformal ? '`#informal`' : `\`#formal - ${page.type}\``;
    const { error } = isInformal
      ? pageSchemas.informalPageSchema.validate(page)
      : pageSchemas.formalPageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(type),
        dv.paragraph(error.message),
      ]);
    else if (['🌰', '🌱'].includes(page.tags[1]))
      pendings.push([
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(type),
        dv.paragraph(isEmpty(page.parents) ? null : page.parents),
        dv.paragraph(page.tags[1]),
      ]);
  });
  const invalidHeaders = ['Entry', 'Type', 'Error'];
  const pendingHeaders = ['Entry', 'Type', 'Parents', 'Status'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved informals or formals found.*');
}

/**
 * Show unresolved practice and provable formals: they have invalid metadata or are not
 * done/proven.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showAllUnresolvedPractice(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#practice OR #formal').forEach((page) => {
    const isPractice = page.tags[0] === '#practice';
    const type = isPractice ? '`#practice`' : `\`#formal - ${page.type}\``;
    const { error } = isPractice
      ? pageSchemas.practicePageSchema.validate(page)
      : pageSchemas.formalPageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(type),
        dv.paragraph(error.message),
      ]);
    else if (!page.done && !page.proved)
      pendings.push([
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(type),
        dv.paragraph(isEmpty(page.parents) ? null : page.parents),
        dv.paragraph(`\`${isPractice ? page['one-or-many'] : 'one'}\``),
      ]);
  });
  const invalidHeaders = ['Entry', 'Type', 'Error'];
  const pendingHeaders = ['Entry', 'Type', 'Parents', 'One-or-many'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved practice or provable formals found.*');
}

/**
 * Show unresolved thoughts: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedThoughts(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#thought').forEach((page) => {
    const { error } = pageSchemas.thoughtPageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(error.message),
      ]);
    else if (['🌰', '🌱'].includes(page.tags[1]))
      pendings.push([
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page.tags[1]),
      ]);
  });
  const invalidHeaders = ['Thought', 'Error'];
  const pendingHeaders = ['Thought', 'Status'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved thoughts found.*');
}

/**
 * Show log entries.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @param {number} limit
 * @returns {void}
 */
export function showLogs(dv, limit = Infinity) {
  const invalids = [];
  let recents = [];
  dv.pages('#log').forEach((page) => {
    const { error } = pageSchemas.logPageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(error.message),
      ]);
    else recents.push([dv.fileLink(page.file.name, false, page.aliases?.[0]), page.date]);
  });
  recents = dv
    .array(recents)
    .sortInPlace(([, date]) => date, 'desc')
    .limit(limit)
    .map(([link, date]) => [
      dv.paragraph(link),
      dv.paragraph(`\`${date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}\``),
    ]);
  const invalidHeaders = ['Log', 'Error'];
  const pendingHeaders = ['Log', 'Date'];
  if (invalids.length && recents.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, recents);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (recents.length) dv.table(pendingHeaders, recents);
  else dv.span('*No unresolved logs found.*');
}

/**
 * Show unresolved practice entries: they have invalid metadata or are not done.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedPractice(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#practice').forEach((page) => {
    const { error } = pageSchemas.practicePageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(error.message),
      ]);
    else if (!page.done)
      pendings.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(page['source-key'] ? `\`${page['source-key']}\`` : null),
        dv.paragraph(page['source-link'] || null),
        dv.paragraph(`\`${page['one-or-many']}\``),
      ]);
  });
  const invalidHeaders = ['Practice', 'Error'];
  const pendingHeaders = ['Practice', 'Source Key', 'Source Link', 'One-or-many'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved practice entries found.*');
}

/**
 * Show unresolved informal entries: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedInformals(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#informal').forEach((page) => {
    const { error } = pageSchemas.informalPageSchema.validate(page);
    if (error)
      invalids.push([
        dv.paragraph(dv.fileLink(page.file.name)),
        dv.paragraph(error.message),
      ]);
    else if (['🌰', '🌱'].includes(page.tags[1]))
      pendings.push([
        dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
        dv.paragraph(page['formal-id'] ? `\`${page['formal-id']}\`` : null),
        dv.paragraph(page.tags[1]),
      ]);
  });
  const invalidHeaders = ['Informal', 'Error'];
  const pendingHeaders = ['Informal', 'Formal ID', 'Status'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved informals found.*');
}

/**
 * Show unresolved unprovable formals: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedUnprovableFormals(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#formal')
    .where(({ type }) => unprovables.has(type))
    .forEach((page) => {
      const { error } = pageSchemas.formalPageSchema.validate(page);
      if (error)
        invalids.push([
          dv.paragraph(dv.fileLink(page.file.name)),
          dv.paragraph(error.message),
        ]);
      else if (['🌰', '🌱'].includes(page.tags[1]))
        pendings.push([
          dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
          dv.paragraph(`\`${page.type}\``),
          dv.paragraph(page.tags[1]),
        ]);
    });
  const invalidHeaders = ['Formal', 'Error'];
  const pendingHeaders = ['Formal', 'Type', 'Status'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved unprovable formals found.*');
}

/**
 * Show unresolved provable formals: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedProvableFormals(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#formal')
    .where(({ type }) => provables.has(type))
    .forEach((page) => {
      const { error } = pageSchemas.formalPageSchema.validate(page);
      if (error)
        invalids.push([
          dv.paragraph(dv.fileLink(page.file.name)),
          dv.paragraph(error.message),
        ]);
      else if (!page.proved)
        pendings.push([
          dv.paragraph(dv.fileLink(page.file.name, false, page.aliases?.[0])),
          dv.paragraph(`\`${page.type}\``),
          dv.paragraph(page.tags[1]),
          dv.paragraph(page.proved),
        ]);
    });
  const invalidHeaders = ['Formal', 'Error'];
  const pendingHeaders = ['Formal', 'Type', 'Status', 'Proved'];
  if (invalids.length && pendings.length) {
    dv.table(invalidHeaders, invalids);
    dv.table(pendingHeaders, pendings);
  } else if (invalids.length) dv.table(invalidHeaders, invalids);
  else if (pendings.length) dv.table(pendingHeaders, pendings);
  else dv.span('*No unresolved provable formals found.*');
}
