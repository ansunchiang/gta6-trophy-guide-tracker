export function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

export function button(label, className, onClick) {
  const node = element('button', className, label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

export function sourceLinks(keys, sources) {
  const links = element('div', 'source-links');
  links.append(element('span', 'eyebrow', keys.length === 1 ? 'SOURCE' : 'SOURCES'));
  for (const key of keys) {
    const { name, url } = sources[key];
    const link = element('a', '', name);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    links.append(link);
  }
  return links;
}
