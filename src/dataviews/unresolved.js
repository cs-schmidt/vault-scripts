import { pageSchemas } from '../schemas';
import { getAPI } from 'obsidian-dataview';

// NOTE: To access the full Dataview API you must pass the Dataview object as an argument.
//       Using `app.plugins.plugins.dataview.api` provides the DataviewAPI object instead
//       of the DataviewInlineAPI object.

const DateTime = getAPI().luxon.DateTime;

/**
 * Show unresolved inquiries: they have invalid metadata or are not done.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
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
  if (invalids.length && pendings.length) {
    dv.table(['**Inquiry**', '**Error**'], invalids);
    dv.table(['**Inquiry**', '**Source Key**', '**Source Link**'], pendings);
  } else if (invalids.length) dv.table(['**Inquiry**', '**Error**'], invalids);
  else if (pendings.length)
    dv.table(['**Inquiry**', '**Source Key**', '**Source Link**'], pendings);
  else dv.span('*No unresolved inquiries found.*');
}

/**
 * Show unresolved practice entries: they have invalid metadata or are not done.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
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
        dv.paragraph(page['one-or-many']),
      ]);
  });
  if (invalids.length && pendings.length) {
    dv.table(['**Practice**', '**Error**'], invalids);
    dv.table(
      ['**Practice**', '**Source Key**', '**Source Link**', '**One-or-many**'],
      pendings,
    );
  } else if (invalids.length) dv.table(['**Practice**', '**Error**'], invalids);
  else if (pendings.length)
    dv.table(
      ['**Practice**', '**Source Key**', '**Source Link**', '**One-or-many**'],
      pendings,
    );
  else dv.span('*No unresolved practice entries found.*');
}

/**
 * Show unresolved informal entries: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
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
  if (invalids.length && pendings.length) {
    dv.table(['**Informal**', '**Error**'], invalids);
    dv.table(['**Informal**', '**Formal ID**', '**Status**'], pendings);
  } else if (invalids.length) dv.table(['**Informal**', '**Error**'], invalids);
  else if (pendings.length)
    dv.table(['**Informal**', '**Formal ID**', '**Status**'], pendings);
  else dv.span('*No unresolved informals found.*');
}

/**
 * Show unresolved unprovable formals: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedUnprovableFormals(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#formal')
    .filter(({ type }) => type === 'definition')
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
  if (invalids.length && pendings.length) {
    dv.table(['**Formal**', '**Error**'], invalids);
    dv.table(['**Formal**', '**Type**', '**Status**'], pendings);
  } else if (invalids.length) dv.table(['**Formal**', '**Error**'], invalids);
  else if (pendings.length) dv.table(['**Formal**', '**Type**', '**Status**'], pendings);
  else dv.span('*No unresolved unprovable formals found.*');
}

/**
 * Show unresolved provable formals: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedProvableFormals(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#formal')
    .filter(({ type }) => ['theorem', 'lemma', 'proposition'].includes(type))
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
  if (invalids.length && pendings.length) {
    dv.table(['**Formal**', '**Error**'], invalids);
    dv.table(['**Formal**', '**Type**', '**Status**', '**Proved**'], pendings);
  } else if (invalids.length) dv.table(['**Formal**', '**Error**'], invalids);
  else if (pendings.length)
    dv.table(['**Formal**', '**Type**', '**Status**', '**Proved**'], pendings);
  else dv.span('*No unresolved provable formals found.*');
}

/**
 * Show unresolved thoughts: they have invalid metadata or are underdeveloped.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedThoughts(dv) {
  const invalids = [];
  const pendings = [];
  dv.pages('#thought').forEach((page) => {
    const { error } = pageSchemas.thoughtPageSchema.validate(page);
    if (error)
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
  if (invalids.length && pendings.length) {
    dv.table(['**Thought**', '**Error**'], invalids);
    dv.table(['**Thought**', '**Status**'], pendings);
  } else if (invalids.length) dv.table(['**Thought**', '**Error**'], invalids);
  else if (pendings.length) dv.table(['**Thought**', '**Status**'], pendings);
  else dv.span('*No unresolved thoughts found.*');
}

/**
 * Show log entries.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
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
  if (invalids.length && recents.length) {
    dv.table(['**Log**', '**Error**'], invalids);
    dv.table(['**Log**', '**Date**'], recents);
  } else if (invalids.length) dv.table(['**Log**', '**Error**'], invalids);
  else if (recents.length) dv.table(['**Log**', '**Date**'], recents);
  else dv.span('*No unresolved logs found.*');
}
