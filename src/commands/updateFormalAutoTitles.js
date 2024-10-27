import { Notice } from 'obsidian';
import { LoaderModal } from '../components';
import {
  requestConfirmation,
  isFormalAutoTitle,
  getCodeClassFromParents,
  fetchEntries,
} from '../utils/entries';
import { PROVABLE_FORMAL_TYPES } from '../utils/constants';
import { isEmpty, capitalize, random, last } from 'lodash-es';
import is from '../utils/types';

const metadata = app.metadataCache;
const provables = new Set(PROVABLE_FORMAL_TYPES);

export default async function updateFormalAutoTitles() {
  const candidates = [];
  const issues = {};
  for (const file of fetchEntries()) {
    const { tags, type, aliases, parents = [] } = metadata.getFileCache(file).frontmatter;
    const name = file.basename;
    const isFormal = tags?.includes('#formal');
    const isAutoTitled = isFormalAutoTitle(name);
    if (isAutoTitled) {
      if (!isFormal) issues[name] = 'Auto-titled non-formal type.';
      else if (!provables.has(type)) issues[name] = 'Auto-titled non-provable type.';
      else if (aliases?.some(is.string)) issues[name] = 'Auto-titled with alias.';
    } else if (!isFormal || !isEmpty(issues)) continue;
    candidates.push({ name, path: file.path, type, parents, isAutoTitled });
  }
  if (!isEmpty(issues)) {
    const message = [
      'Resolve the issues below before updating auto-titles:\n',
      ...Object.entries(issues).map(([name, message]) => `\t• ${name}: ${message}\n`),
    ].join('');
    console.error(message);
    new Notice('Formal auto-title update failed (see console)');
  } else {
    const renames = getRenameList(candidates);
    if (isEmpty(renames)) new Notice('No renames are required');
    else if (await requestConfirmation()) {
      const loadingModal = new LoaderModal(1000);
      loadingModal.open();
      const uid = generateUniqueFilenamePrefix();
      const initMap = renames.map(({ oldPath }, i) => [oldPath, `entries/${uid}${i}.md`]);
      const lastMap = renames.map(({ newPath }, i) => [`entries/${uid}${i}.md`, newPath]);
      await changePaths(initMap);
      await changePaths(lastMap);
      loadingModal.close();
    } else new Notice('Update aborted');
  }

  // **************************************************
  function getRenameList(candidates) {
    const result = [];
    const typeClassesMap = Object.fromEntries(
      [...provables].map((type) => [type, { classAutos: {}, classFixes: {} }]),
    );
    for (const { name, path, type, isAutoTitled, parents } of candidates) {
      const codeClass = getCodeClassFromParents(parents);
      const classAutos = typeClassesMap[type].classAutos;
      const classFixes = typeClassesMap[type].classFixes;
      if (!Object.hasOwn(classAutos, codeClass)) classAutos[codeClass] = [];
      if (!Object.hasOwn(classFixes, codeClass)) classFixes[codeClass] = [];
      if (isAutoTitled && name.startsWith(`${capitalize(type)} ${codeClass}`))
        classAutos[codeClass].push({ name, path });
      else classFixes[codeClass].push({ name, path });
    }
    for (const type of Object.keys(typeClassesMap)) {
      const classAutos = typeClassesMap[type].classAutos;
      const classFixes = typeClassesMap[type].classFixes;
      for (const codeClass of Object.keys(classAutos)) {
        const autos = classAutos[codeClass].sort(({ name: name1 }, { name: name2 }) => {
          if (name1 > name2) return -1;
          if (name1 < name2) return 1;
          return 0;
        });
        const fixes = classFixes[codeClass];
        const total = autos.length + fixes.length;
        for (let count = 0; count < total; count++) {
          if (!isEmpty(autos) && count == parseCodeNumber(last(autos).name)) autos.pop();
          else
            result.push({
              oldPath: isEmpty(fixes) ? autos.pop().path : fixes.pop().path,
              newPath: `entries/${capitalize(type)} ${codeClass}-${count}.md`,
            });
        }
      }
    }
    return result;

    // **************************************************
    function parseCodeNumber(str) {
      if (!is.string(str)) return NaN;
      return Number(str.match(/-(.*)$/)?.[1]);
    }
  }

  function generateUniqueFilenamePrefix() {
    let result = '';
    const prefixes = new Set(fetchEntries().map((file) => file.basename.slice(0, 10)));
    do {
      const codePoints = [];
      for (let i = 0; i < 10; i++) codePoints.push(random(65, 90));
      result = String.fromCodePoint(...codePoints);
    } while (prefixes.has(result));
    return result;
  }

  async function changePaths(pathEntries) {
    for (const [inPath, outPath] of pathEntries) {
      const file = app.vault.getFileByPath(inPath);
      const backlinkPaths = new Set(metadata.getBacklinksForFile(file).data.keys());
      backlinkPaths.delete(file.path);
      if (!isEmpty(backlinkPaths)) {
        const backlinksUpdated = new Promise((resolve) => {
          const updateListener = app.vault.on('modify', ({ path }) => {
            if (backlinkPaths.has(path)) backlinkPaths.delete(path);
            if (isEmpty(backlinkPaths)) resolve(updateListener);
          });
        });
        app.fileManager.renameFile(file, outPath);
        app.vault.offref(await backlinksUpdated);
      } else await app.fileManager.renameFile(file, outPath);
    }
  }
}
