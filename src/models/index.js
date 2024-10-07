import Joi from 'joi';
import { SOURCE_KEY_REGEX, SOURCE_KEY_PARSE_REGEX } from '../utils/constants';
import { getAPI } from 'obsidian-dataview';

const isLink = getAPI().value.isLink;
const httpUrlSchema = Joi.string().uri({ scheme: /https?/ });

/** Model for inquiry pages. */
export const inquiryPageSchema = Joi.object({
  tags: Joi.array().length(1).has(Joi.string().equal('#inquiry')).messages({
    'array.base': '`tags` is not an array.',
    'array.length': '`tags` must contain only one value.',
    'array.hasKnown': "`tags` must contain '#inquiry'.",
    'any.required': '`tags` is missing.',
  }),
  parents: Joi.array()
    .custom((value, { error }) => {
      for (const val of value) {
        if (isLink(val)) {
          const tags = app.metadataCache.getCache(val.path).frontmatter?.tags;
          if (tags.includes('#informal')) return error('link.toNonInformal');
        } else return error('link.base');
      }
      return value;
    })
    .messages({
      'array.base': '`parents` is not an array.',
      'link.base': '`parents` contains a non-link value.',
      'link.toNonInformal': '`parents` contains a link to a non-informal note.',
      'any.required': '`parents` is missing.',
    }),
  'source-key': Joi.string()
    .allow('')
    .regex(SOURCE_KEY_REGEX)
    .custom((value, { state, error }) => {
      const title = state.ancestors[0]?.file?.name;
      if (title == undefined) return error('title.required');
      if (typeof title != 'string') return error('title.base');
      const parsedKey = title.match(SOURCE_KEY_PARSE_REGEX)?.[1];
      if (parsedKey == undefined) return error('title.noSourceKey');
      if (parsedKey != value) return error('title.match');
      return value;
    }, 'Page title validation.')
    .messages({
      'string.base': '`source-key` is not a string.',
      'string.pattern.base': '`source-key` is not valid.',
      'any.required': '`source-key` is missing.',
      'title.base': 'Title is not a string.',
      'title.noSourceKey': 'Cannot parse `source-key` from title.',
      'title.match': 'Title source key does not match `source-key`.',
      'title.required': 'Title is missing.',
    }),
  'source-link': Joi.alternatives(Joi.string().allow(''), Joi.object())
    .custom((value, { error }) => {
      if (typeof value == 'object' && !isLink(value)) return error('link.base');
      if (typeof value == 'string' && value.length) {
        const markdownLinkUrl = value.match(/^\[.*\]\((.*)\)$/)?.[1];
        if (markdownLinkUrl == undefined) return error('link.noURL');
        if (httpUrlSchema.validate(markdownLinkUrl).error) return error('link.nonHTTP');
      } else return value;
    })
    .messages({
      'string.base': '`source-link` is not a string.',
      'any.required': '`source-link` is missing.',
      'link.base': '`source-link` contains a non-link value.',
      'link.noURL': '`source-link` is a markdown link with no URL.',
      'link.nonHTTP': '`source-link` is a markdown link with a non-HTTP URL.',
    }),
  done: Joi.boolean().messages({
    'boolean.base': '`done` is not a boolean.',
    'any.required': '`done` is missing.',
  }),
})
  .prefs({ presence: 'required' })
  .unknown();
