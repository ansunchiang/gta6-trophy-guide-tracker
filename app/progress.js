const storageKey = 'leonida-atlas:ps5:v1';
const format = 'leonida-atlas-ps5';

export function createProgress(trophies) {
  const validIds = new Set(trophies.map(({ id }) => id));
  const defaults = { earned: new Set(), hideStory: true };

  function parse(text) {
    const backup = JSON.parse(text);
    if (
      backup?.format !== format || backup.version !== 1 ||
      typeof backup.hideStory !== 'boolean' || !Array.isArray(backup.earned) ||
      backup.earned.length > validIds.size || backup.earned.some(id => !validIds.has(id))
    ) throw new Error('Choose a Leonida Atlas progress backup.');
    const earned = new Set(backup.earned);
    if (earned.size !== backup.earned.length) throw new Error('The backup contains duplicate trophies.');
    return { earned, hideStory: backup.hideStory };
  }

  function serialize({ earned, hideStory }) {
    return JSON.stringify({ format, version: 1, hideStory, earned: [...earned].sort((a, b) => a - b) }, null, 2);
  }

  function load() {
    try {
      const saved = localStorage.getItem(storageKey);
      return { state: saved ? parse(saved) : defaults, issue: '' };
    } catch {
      return { state: defaults, issue: 'Saved progress is unavailable. You can restore a backup or start a new checklist.' };
    }
  }

  function save(state) {
    try {
      localStorage.setItem(storageKey, serialize(state));
      return true;
    } catch {
      return false;
    }
  }

  return { load, save, parse, serialize };
}
