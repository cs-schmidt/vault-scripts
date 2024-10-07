import { isValidSourceKey, parseSourceKey, isValidFormalID } from '../utils/templates';
import { inquiryPageSchema } from '../models';

// NOTE: To get access to the full Dataview API you must pass the Dataview object as an
//       argument. Accessing the API using `app.plugins.plugins.dataview.api` gives you
//       the "DataviewAPI" object instead of the "DataviewInlineAPI" object.

// TODO: In all unresolved type queries, make sure parents are informal types only.

/**
 * Display unresolved inquiries: they aren't done or have a source key error.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedInquiries(dv) {
  const invalidNotes = [];
  const pendingNotes = [];
  dv.pages('#inquiry').forEach((page) => {
    const { error } = inquiryPageSchema.validate(page);
    if (error) invalidNotes.push([dv.fileLink(page.file.name), error.message]);
    else if (!page.done)
      pendingNotes.push([
        dv.fileLink(page.file.name),
        page['source-key'] ? `\`${page['source-key']}\`` : null,
        page['source-link'] ? page['source-link'] : null,
      ]);
  });
  if (invalidNotes.length && pendingNotes.length) {
    dv.header(4, '**Invalid Inquiries**');
    dv.table(['**Invalid Inquiry**', '**Error Message**'], invalidNotes);
    dv.header(4, '==Pending Inquiries==');
    dv.table(['**Pending Inquiry**', '**Source Key**', '**Source Link**'], pendingNotes);
  } else if (invalidNotes.length) {
    dv.header(4, '**Invalid Inquiries**');
    dv.table(['**Invalid Inquiry**', '**Error Message**'], invalidNotes);
  } else if (pendingNotes.length)
    dv.table(['**Pending Inquiry**', '**Source Key**', '**Source Link**'], pendingNotes);
  else dv.span('*No unresolved inquiries found.*');
}

// TODO: Include unproved formal entries in this display as well.
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

  // **************************************************
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
        sourceKey ? `\`${sourceKey}\`` : null,
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

  // **************************************************
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

  // **************************************************
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

// TODO: Implement `showUnresolvedLogs` function.
/**
 * Display unresolved logs: i.e., those with an invalid status.
 * @param {DataviewInlineAPI} dv - Dataview's inline API.
 * @returns {void}
 */
export function showUnresolvedLogs(dv) {
  dv.span('*No unresolved thoughts found.*');
}
