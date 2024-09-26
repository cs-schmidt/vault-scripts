import { getAPI } from 'obsidian-dataview';

/**
 * Check if `filename` is unique under the "entries/" folder.
 * @param {string} filename
 * @returns {boolean}
 */
export default function isUniqueFilename(filename) {
  // TODO: Make this throw an error when Dataview isn't available.
  return getAPI()
    .pages('"entries"')
    .map((page) => page.file.name)
    .every((pageFilename) => pageFilename !== filename);
}
