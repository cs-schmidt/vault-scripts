import Joi from 'joi';
import * as metadataSchemas from './metadata';
import { isValidFormalID } from '../utils/entries';
import { FORMAL_TYPES, PROVABLE_FORMAL_TYPES } from '../utils/constants';
import is from '../utils/types';

export const inquiryPageSchema = Joi.object({
  tags: metadataSchemas.makeTagsSchema('inquiry'),
  parents: metadataSchemas.parentsSchema,
  'source-key': metadataSchemas.makeSourceKeySchema(),
  'source-link': metadataSchemas.sourceLinkSchema,
  done: metadataSchemas.doneSchema,
})
  .prefs({ presence: 'required' })
  .unknown();

export const practicePageSchema = Joi.object({
  tags: metadataSchemas.makeTagsSchema('practice'),
  parents: metadataSchemas.parentsSchema,
  'source-key': metadataSchemas.makeSourceKeySchema(false),
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
  tags: metadataSchemas.makeTagsSchema('informal', false),
  aliases: metadataSchemas.aliasesSchema,
  parents: metadataSchemas.parentsSchema,
  'formal-id': Joi.string()
    .allow('')
    .custom((id, { error }) => (!isValidFormalID(id) ? error('any.only') : id))
    .messages({
      'string.base': '`formal-id` is not a string.',
      'any.only': '`formal-id` is not a valid string.',
      'any.required': '`formal-id` is missing.',
    }),
})
  .prefs({ presence: 'required' })
  .unknown();

export const formalPageSchema = Joi.object({
  tags: metadataSchemas.makeTagsSchema('formal', false),
  aliases: metadataSchemas.aliasesSchema,
  parents: metadataSchemas.parentsSchema,
  type: Joi.string()
    .equal(...FORMAL_TYPES)
    .messages({
      'string.base': '`type` is not a string.',
      'any.only': '`type` is not a valid string.',
      'any.required': '`type` is missing.',
    }),
  proved: Joi.boolean()
    .when('type', {
      is: Joi.string().equal(...PROVABLE_FORMAL_TYPES),
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
  tags: metadataSchemas.makeTagsSchema('thought', false),
  aliases: metadataSchemas.aliasesSchema,
  parents: metadataSchemas.parentsSchema,
})
  .prefs({ presence: 'required' })
  .unknown();

export const logPageSchema = Joi.object({
  tags: metadataSchemas.makeTagsSchema('log'),
  aliases: metadataSchemas.aliasesSchema,
  date: Joi.custom((value, { error }) => {
    if (!is.date(value)) return error('string.base');
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
