import normalizeString from './normalizeString';

export default (a, b, key = null) => {
  const s1 = key ? a[key] : a;
  const s2 = key ? b[key] : b;
  if (normalizeString(s1) < normalizeString(s2)) return -1;
  if (normalizeString(s1) > normalizeString(s2)) return 1;
  return 0;
};
