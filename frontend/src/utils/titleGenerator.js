/**
 * Smart title generator that extracts key concepts and keywords strictly from 
 * the AI-generated insights to dynamically frame a descriptive title.
 */
export function generateTitle(insights, content) {
  if (!insights) return "Document Analysis";

  // Clean the insights text from markdown formatting
  const cleanInsights = insights.replace(/[*_#`[\]()]/g, '').trim();

  // 1. Check if there's a heading inside the insights markdown (e.g., "# Title" or "## Title")
  const headingMatch = insights.match(/^#+\s+(.+)$/m);
  if (headingMatch && headingMatch[1]) {
    const title = headingMatch[1].replace(/[*_`]/g, '').trim();
    if (title.length > 3 && title.length < 50 && !title.toLowerCase().includes('insight') && !title.toLowerCase().includes('summary')) {
      return title;
    }
  }

  // 2. Extract capitalized words (Proper nouns/Nouns) from the insights text representing key concepts
  const words = cleanInsights.match(/[A-Z][a-z]+/g) || [];
  const stopWords = new Set([
    'The', 'And', 'For', 'With', 'From', 'This', 'That', 'Your', 'Their', 'Mern', 'Redis',
    'Socket', 'Here', 'This', 'Each', 'Document', 'Analysis', 'Insights', 'Report', 'Key',
    'AI', 'Summary', 'Overall', 'Main', 'Important', 'These', 'Also', 'They', 'It', 'There'
  ]);

  const filteredWords = words.filter(w => w.length > 3 && w.length < 15 && !stopWords.has(w));
  
  // Calculate frequencies of proper nouns in insights
  const freqMap = {};
  filteredWords.forEach(w => {
    freqMap[w] = (freqMap[w] || 0) + 1;
  });

  // Sort by frequency
  const sortedWords = Object.keys(freqMap).sort((a, b) => freqMap[b] - freqMap[a]);

  if (sortedWords.length >= 2) {
    return `${sortedWords[0]} & ${sortedWords[1]} Analysis`;
  } else if (sortedWords.length === 1) {
    return `${sortedWords[0]} Report`;
  }

  // 3. Fallback: Look for high-frequency common words (nouns/verbs) in insights text
  const commonWords = cleanInsights.toLowerCase().match(/\b[a-z]{4,15}\b/g) || [];
  const stopWordsCommon = new Set([
    'the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'for', 'it', 'on', 'with', 'as', 'this', 'its', 'by', 'an', 'be', 'are', 'was', 'were', 'from', 'at', 'or', 'an', 'document', 'insights', 'analysis', 'report', 'key', 'ai', 'content', 'summary', 'text', 'information', 'data', 'section', 'about', 'contains', 'discusses', 'provides', 'first', 'second', 'third', 'after', 'before', 'their', 'your'
  ]);

  const filteredCommon = commonWords.filter(w => !stopWordsCommon.has(w));
  const freqMapCommon = {};
  filteredCommon.forEach(w => {
    freqMapCommon[w] = (freqMapCommon[w] || 0) + 1;
  });

  const sortedCommon = Object.keys(freqMapCommon).sort((a, b) => freqMapCommon[b] - freqMapCommon[a]);

  if (sortedCommon.length >= 2) {
    const w1 = sortedCommon[0].charAt(0).toUpperCase() + sortedCommon[0].slice(1);
    const w2 = sortedCommon[1].charAt(0).toUpperCase() + sortedCommon[1].slice(1);
    return `${w1} & ${w2} Summary`;
  } else if (sortedCommon.length === 1) {
    const w1 = sortedCommon[0].charAt(0).toUpperCase() + sortedCommon[0].slice(1);
    return `${w1} Analysis`;
  }

  // 4. Last Fallback: Extract from the first line of raw document content if insights are very short
  if (content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/[*_#`[\]()]/g, '').trim();
      if (firstLine.length > 3 && firstLine.length < 40) {
        return firstLine;
      }
    }
  }

  return "Insight Summary";
}
