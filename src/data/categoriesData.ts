import { CategoryInfo } from '../types/news';

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    name: 'Technology',
    count: 100,
    percentage: 2.3,
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeText: 'text-blue-700',
    description: 'Artificial intelligence, software engineering, semiconductor hardware, quantum computing, cloud infrastructure, and cybersecurity developments.',
    keywords: ['AI', 'software', 'computing', 'processor', 'cloud', 'cyber', 'neural', 'algorithm', 'data', 'tech']
  },
  {
    name: 'World',
    count: 100,
    percentage: 2.3,
    color: '#10B981', // Emerald / Teal
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    badgeText: 'text-emerald-700',
    description: 'International diplomacy, cross-border treaties, geopolitical affairs, humanitarian operations, and United Nations global resolutions.',
    keywords: ['diplomacy', 'treaty', 'global', 'nations', 'summit', 'foreign', 'international', 'peace', 'border']
  },
  {
    name: 'Business',
    count: 1377,
    percentage: 31.8,
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeText: 'text-amber-700',
    description: 'Financial markets, central bank interest rates, macroeconomic forecasts, corporate mergers, venture investments, and commerce trends.',
    keywords: ['markets', 'stocks', 'economy', 'inflation', 'investors', 'revenue', 'banking', 'venture', 'trade']
  },
  {
    name: 'Politics',
    count: 200,
    percentage: 4.6,
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
    badgeText: 'text-purple-700',
    description: 'Legislative acts, parliamentary debates, election campaigns, government policy directives, and public governance initiatives.',
    keywords: ['policy', 'election', 'government', 'leaders', 'parliament', 'senate', 'legislation', 'campaign', 'vote']
  },
  {
    name: 'Sports',
    count: 1408,
    percentage: 32.5,
    color: '#EC4899', // Pink / Rose
    badgeBg: 'bg-pink-50 border-pink-200 text-pink-700',
    badgeText: 'text-pink-700',
    description: 'Championship tournaments, athletic records, cricket, soccer, tennis, basketball, and professional Olympic competition updates.',
    keywords: ['match', 'cricket', 'victory', 'tournament', 'player', 'coach', 'stadium', 'championship', 'league', 'score']
  },
  {
    name: 'Health',
    count: 100,
    percentage: 2.3,
    color: '#EF4444', // Red / Rose
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    badgeText: 'text-rose-700',
    description: 'Clinical trials, pharmaceuticals, epidemiology, public healthcare, oncology breakthroughs, and wellness diagnostics.',
    keywords: ['treatment', 'disease', 'recovery', 'clinical', 'hospital', 'therapy', 'patient', 'medical', 'vaccine']
  },
  {
    name: 'Science',
    count: 100,
    percentage: 2.3,
    color: '#6366F1', // Indigo
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    badgeText: 'text-indigo-700',
    description: 'Deep space astrophysics, planetary discoveries, particle physics, genetic sequencing, and quantum mechanics.',
    keywords: ['planet', 'space', 'astronomy', 'physics', 'scientists', 'galaxy', 'solar', 'quantum', 'laboratory']
  },
  {
    name: 'Entertainment',
    count: 100,
    percentage: 2.3,
    color: '#F97316', // Orange
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-700',
    badgeText: 'text-orange-700',
    description: 'Cinema, film festivals, television production, streaming entertainment, music awards, and artistic performances.',
    keywords: ['film', 'cinema', 'actor', 'music', 'album', 'festival', 'concert', 'awards', 'premiere']
  },
  {
    name: 'Crime',
    count: 225,
    percentage: 5.2,
    color: '#DC2626',
    badgeBg: 'bg-red-50 border-red-200 text-red-700',
    badgeText: 'text-red-700',
    description: 'Police investigations, arrests, criminal charges, court proceedings, and public safety incidents.',
    keywords: ['police', 'investigation', 'arrest', 'court', 'fraud', 'crime', 'charges', 'custody']
  },
  {
    name: 'Climate',
    count: 225,
    percentage: 5.2,
    color: '#D97706',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeText: 'text-amber-700',
    description: 'Climate change, extreme weather, global warming, greenhouse gas emissions, and climate policy.',
    keywords: ['climate', 'warming', 'heatwave', 'emissions', 'carbon', 'drought', 'flood', 'climate change']
  },
  {
    name: 'Environment',
    count: 200,
    percentage: 4.6,
    color: '#14B8A6', // Teal
    badgeBg: 'bg-teal-50 border-teal-200 text-teal-700',
    badgeText: 'text-teal-700',
    description: 'Conservation, biodiversity, pollution, renewable energy, and protection of natural ecosystems.',
    keywords: ['renewable', 'pollution', 'sustainability', 'ecology', 'biodiversity', 'conservation', 'wildlife', 'solar']
  },
  {
    name: 'Education',
    count: 200,
    percentage: 4.6,
    color: '#06B6D4', // Cyan
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    badgeText: 'text-cyan-700',
    description: 'Academic universities, STEM curricula, student research scholarship, and pedagogical education innovations.',
    keywords: ['university', 'students', 'curriculum', 'education', 'school', 'academic', 'professors', 'degree']
  }
];

export const TOTAL_ARTICLES = CATEGORIES_DATA.reduce((total, category) => total + category.count, 0);
export const TOTAL_CATEGORIES = 12;
export const OVERALL_ACCURACY = 99.67;
export const SELECTED_MODEL = 'Logistic Regression';

export function getCategoryDistribution(
  categoryCounts: Record<string, number> | undefined,
  totalSamples: number
): CategoryInfo[] {
  if (!categoryCounts) return [];

  return CATEGORIES_DATA
    .map((category) => {
      const count = categoryCounts[category.name] ?? 0;
      return {
        ...category,
        count,
        percentage: totalSamples > 0
          ? Number(((count / totalSamples) * 100).toFixed(1))
          : 0,
      };
    })
    .sort((first, second) => second.count - first.count);
}

export function getCategoryBadgeStyle(catName: string): { bg: string; text: string; dot: string } {
  const cat = CATEGORIES_DATA.find(c => c.name.toLowerCase() === catName.toLowerCase());
  if (!cat) {
    return { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: '#64748B' };
  }
  return {
    bg: cat.badgeBg,
    text: cat.badgeText,
    dot: cat.color
  };
}
