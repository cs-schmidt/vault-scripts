import Joi from 'joi';
import * as metadataSchemas from './metadata';
import { isValidSourceKey, parseSourceKey, isValidFormalID } from '../utils/helpers';
import { getAPI } from 'obsidian-dataview';

const isDate = getAPI().value.isDate;

export const inquiryPageSchema = Joi.object({
  tags: metadataSchemas.makeNonStatusTagsSchema('inquiry'),
  parents: metadataSchemas.parentsSchema,
  'source-key': Joi.string()
    .allow('')
    .custom((value, { state, error }) => {
      if (!isValidSourceKey(value) || value == '*') return error('any.invalid');
      const title = state.ancestors[0]?.file?.name;
      const titleSourceKey = parseSourceKey(typeof title == 'string' ? title : '');
      if (!titleSourceKey) return error('page.noTitleSourceKey');
      if (titleSourceKey != value) return error('page.sourceKeyMismatch');
      return value;
    })
    .messages({
      'string.base': '`source-key` is not a string.',
      'any.invalid': '`source-key` is not a valid string.',
      'any.required': '`source-key` is missing.',
      'page.noTitleSourceKey': 'Cannot get title source key.',
      'page.sourceKeyMismatch': '`source-key` mismatch.',
    }),
  'source-link': metadataSchemas.sourceLinkSchema,
  done: metadataSchemas.doneSchema,
})
  .prefs({ presence: 'required' })
  .unknown();

export const practicePageSchema = Joi.object({
  tags: metadataSchemas.makeNonStatusTagsSchema('practice'),
  parents: metadataSchemas.parentsSchema,
  'source-key': Joi.string()
    .allow('')
    .custom((value, { state, error }) => {
      if (!isValidSourceKey(value)) return error('any.invalid');
      const title = state.ancestors[0]?.file?.name;
      const titleSourceKey = parseSourceKey(typeof title == 'string' ? title : '');
      if (!titleSourceKey) return error('page.noTitleSourceKey');
      if (titleSourceKey != value) return error('page.titleSourceKeyMismatch');
      return value;
    })
    .messages({
      'string.base': '`source-key` is not a string.',
      'any.invalid': '`source-key` is not a valid string.',
      'any.required': '`source-key` is missing.',
      'page.noTitleSourceKey': 'Cannot find title source key.',
      'page.sourceKeyMismatch': '`source-key` mismatch.',
    }),
  'source-link': metadataSchemas.sourceLinkSchema,
  'one-or-many': Joi.string().equal('one', 'many').messages({
    'string.base': '`one-or-many` is not a string.',
    'any.only': '`one-or-many` is not a valid string.',
    'any.required': '`one-or-many` is missing.',
  }),
  done: metadataSchemas.doneSchema,
})
  .prefs({ presence: 'required' })
  .unknown();

export const informalPageSchema = Joi.object({
  tags: metadataSchemas.makeStatusedTagsSchema('informal'),
  aliases: metadataSchemas.aliasesSchema,
  parents: metadataSchemas.parentsSchema,
  'formal-id': Joi.string()
    .allow('')
    .custom((value, { error }) =>
      value && !isValidFormalID(value) ? error('any.only') : value,
    )
    .messages({
      'string.base': '`formal-id` is not a string.',
      'any.only': '`formal-id` is not a valid string.',
      'any.required': '`formal-id` is missing.',
    }),
})
  .prefs({ presence: 'required' })
  .unknown();

export const formalPageSchema = Joi.object({
  tags: metadataSchemas.makeStatusedTagsSchema('formal'),
  aliases: metadataSchemas.aliasesSchema,
  parents: metadataSchemas.parentsSchema,
  type: Joi.string().equal('definition', 'theorem', 'lemma', 'proposition').messages({
    'string.base': '`type` is not a string.',
    'any.only': '`type` is not a valid string.',
    'any.required': '`type` is missing.',
  }),
  proved: Joi.boolean()
    .when('type', {
      is: Joi.string().equal('theorem', 'lemma', 'proposition'),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'boolean.base': '`proved` is not a boolean.',
      'any.only': '`proved` is not a valid string.',
      'any.required': '`proved` is missing.',
      'any.unknown': '`proved` exists when it should not.',
    }),
})
  .prefs({ presence: 'required' })
  .unknown();

export const thoughtPageSchema = Joi.object({
  tags: metadataSchemas.makeStatusedTagsSchema('thought'),
  aliases: metadataSchemas.aliasesSchema,
  parents: metadataSchemas.parentsSchema,
})
  .prefs({ presence: 'required' })
  .unknown();

export const logPageSchema = Joi.object({
  tags: metadataSchemas.makeNonStatusTagsSchema('log'),
  aliases: metadataSchemas.aliasesSchema,
  date: Joi.custom((value, { error }) => {
    if (!isDate(value)) return error('string.base');
    value = value.toString();
    const { error: formatError } = Joi.string().isoDate().validate(value);
    if (formatError) return error('string.base');
    return value;
  }).messages({
    'string.base': '`date` is not a valid ISO 8601 string.',
    'any.required': '`date` is missing.',
  }),
})
  .prefs({ presence: 'required' })
  .unknown();
