export const newsId = story => story.id || story.url;
export function categoryMatches(story, categoryId, categories = []) {
  if (!categoryId) return true;
  const parents = new Map(categories.map(c => [c.id, c.parentId]));
  return [story.categoryId, story.section, ...(story.categoryIds || [])].filter(Boolean).some(id => {
    const seen = new Set();
    while (id && !seen.has(id)) {
      if (id === categoryId) return true;
      seen.add(id); id = parents.get(id);
    }
    return false;
  });
}
export function selectNews(block, stories, categories = []) {
  const mode = block.newsSource || 'all';
  const ids = [...new Set(block.selectedNews || [])];
  let items = mode === 'manual'
    ? ids.map(id => stories.find(story => newsId(story) === id)).filter(Boolean)
    : stories.filter(story => mode !== 'category' || (block.newsCategory && categoryMatches(story, block.newsCategory, categories)));
  const order = block.newsOrder || (mode === 'manual' ? 'manual' : 'latest');
  if (order === 'title') items = [...items].sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  else if (order === 'latest' || order === 'oldest') {
    const positions = new Map(stories.map((story, index) => [newsId(story), index]));
    const date = story => Date.parse(story.publishedAt || story.dateISO || '') || 0;
    items = [...items].sort((a, b) => {
      const delta = date(b) - date(a) || positions.get(newsId(a)) - positions.get(newsId(b));
      return order === 'oldest' ? -delta : delta;
    });
  }
  const limit = Math.max(1, Math.min(12, Number(block.limit) || 4));
  return items.slice(0, limit);
}
