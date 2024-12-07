import { getAPI } from 'obsidian-dataview';

const dataviewAPI = getAPI();
const is = {
  /**
   * Checks if the input is a Dataview date object. Internally, it checks if the input is
   * an instance of Luxon's DateTime class.
   * @param {any} value
   * @returns {boolean}
   */
  date(value) {
    return dataviewAPI.value.isDate(value);
  },

  /**
   * Checks if the input is a function.
   * @param {any} value
   * @returns {boolean}
   */
  function(value) {
    return typeof value == 'function';
  },

  /**
   * Checks if the input is a Dataview link object. Internally, it checks if the input is
   * an instance of Dataview's Link class.
   * @param {any} value
   * @returns {boolean}
   */
  link(value) {
    return dataviewAPI.value.isLink(value);
  },

  /**
   * Checks if the input is nullable (either null or undefined).
   * @param {any} value
   * @returns {boolean}
   */
  nullable(value) {
    return value == undefined;
  },

  /**
   * Checks if the input is a number primitive.
   * @param {any} value
   * @returns {boolean}
   */
  number(value) {
    return typeof value == 'number';
  },

  /**
   * Checks if the input is a string primitive.
   * @param {any} value
   * @returns {boolean}
   */
  string(value) {
    return typeof value == 'string';
  },

  /**
   * Checks if the input is an object.
   * @param {any} value
   * @returns {boolean}
   */
  object(value) {
    return value && typeof value == 'object';
  },
};

export default is;
