import Joi from 'joi';
import { getAPI } from 'obsidian-dataview';

const isLink = getAPI().value.isLink;
const httpUrlSchema = Joi.string().uri({ scheme: /https?/ });

/** Schema for the aliases property on Dataview pages objects (SMarkdownPages). */
export const aliasesSchema = Joi.array().items(Joi.string()).messages({
  'array.base': '`aliases` is not an array.',
  'string.base': '`aliases` has non-string value.',
  'string.empty': '`aliases` has an empty string.',
  'any.required': '`aliases` is missing.',
});

/** Schema for the parents property on Dataview pages objects (SMarkdownPages). */
export const parentsSchema = Joi.array()
  .custom((parents, { error }) => {
    const isInvalid = parents.some((value) => {
      if (!isLink(value)) return true;
      const linkedNote = app.metadataCache.getCache(value.path);
      if (!linkedNote) return true;
      if (!linkedNote.frontmatter?.tags?.some((tag) => tag == '#informal' || tag == 'ℹ️'))
        return true;
    });
    return isInvalid ? error('any.only') : parents;
  })
  .messages({
    'array.base': '`parents` is not an array.',
    'any.only': '`parents` can only have links to notes with tag #informal or ℹ️.',
    'any.required': '`parents` is missing.',
  });

/** Schema for the source-link property on Dataview pages objects (SMarkdownPages). */
export const sourceLinkSchema = Joi.alternatives(Joi.string().allow(''), Joi.object())
  .custom((sourceLink, { error }) => {
    if (typeof sourceLink == 'object' && !isLink(sourceLink))
      return error('object.invalid');
    if (typeof sourceLink == 'string' && sourceLink) {
      const [display, URL] = sourceLink.match(/^\[(.*)\]\((.*)\)$/)?.slice(1) || [];
      if (display == undefined) return error('string.invalid');
      if (!display) return error('string.noDisplay');
      if (!URL) return error('string.noURL');
      if (httpUrlSchema.validate(URL).error) return error('string.noHTTP');
    } else return sourceLink;
  })
  .messages({
    'alternatives.types': '`source-link` is not a string or link object.',
    'string.invalid': '`source-link` is not an empty or markdown link string.',
    'string.noDisplay': '`source-link` is a markdown link with no display text.',
    'string.noURL': '`source-link` is a markdown link with no URL.',
    'string.noHTTP': '`source-link` is a markdown link with a non-HTTP URL.',
    'object.invalid': '`source-link` is not a link object.',
    'any.required': '`source-link` is missing.',
  });

/** Schema for the done property on Dataview pages objects (SMarkdownPages). */
export const doneSchema = Joi.boolean().messages({
  'boolean.base': '`done` is not a boolean.',
  'any.required': '`done` is missing.',
});

/**
 * Creates a Schema for the tags property on Dataview pages objects (SMarkdownPages).
 * @param {string} type The notes type: e.g., "inquiry", "practice", etc.
 * @param {boolean} noStatus Makes a schema that won't look for a status in the array.
 */
export function makeTagsSchema(type, noStatus = true) {
  const typeSchema = Joi.string().equal(`#${type}`);
  const messageDefaults = {
    'array.base': '`tags` is not an array.',
    'any.required': '`tags` is missing.',
  };
  return noStatus
    ? Joi.array()
        .ordered(typeSchema)
        .messages({
          ...messageDefaults,
          'array.orderedLength': '`tags` must contain one value only.',
          'any.only': `\`tags\` must contain '#${type}'.`,
        })
    : Joi.array()
        .ordered(typeSchema, Joi.string().equal('🌰', '🌱', '🌿', '🌲'))
        .messages({
          ...messageDefaults,
          'array.orderedLength': '`tags` must contain two values only.',
          'any.only': `\`tags\` must contain '#${type}' and a status (🌰, 🌱, 🌿, 🌲).`,
        });
}
