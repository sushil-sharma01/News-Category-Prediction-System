import { TrendingArticle } from '../types/news';

// Images generated via generate_image matching real news photography
import aiImg from '../assets/images/news_ai_computing_1790774976142.jpg';
import cricketImg from '../assets/images/news_cricket_match_1790774994472.jpg';
import marketsImg from '../assets/images/news_global_markets_1790775005771.jpg';
import medicalImg from '../assets/images/news_medical_research_1790775024937.jpg';
import spaceImg from '../assets/images/news_space_discovery_1790775036348.jpg';
import climateImg from '../assets/images/news_climate_summit_1790775049065.jpg';

export const TRENDING_NEWS: TrendingArticle[] = [
  {
    id: 'trend-1',
    category: 'Technology',
    headline: 'New AI technology transforms modern computing',
    article: 'Semiconductor engineers and artificial intelligence researchers have revealed a breakthrough in neural architecture design, reducing transformer model inference latency by forty percent while cutting data center energy overhead. Cloud providers are already deploying the accelerator chips across distributed server clusters.',
    timestamp: '2h ago',
    imageUrl: aiImg
  },
  {
    id: 'trend-2',
    category: 'Sports',
    headline: 'India secures victory in thrilling cricket match',
    article: 'In a breathless final over under the stadium floodlights, India held their nerve against fierce opposition to seal a five-run international championship victory. The bowling spearhead defended ten runs in the decisive six deliveries, sparking euphoric celebrations across the packed stands.',
    timestamp: '3h ago',
    imageUrl: cricketImg
  },
  {
    id: 'trend-3',
    category: 'Business',
    headline: 'Global markets respond to latest economic updates',
    article: 'International equities posted solid gains across Frankfurt, Tokyo, and New York as benchmark inflation indices cooled faster than Wall Street projections. Central bankers signaled a pause in monetary tightening, prompting heavy institutional capital inflows into technology and green infrastructure funds.',
    timestamp: '4h ago',
    imageUrl: marketsImg
  },
  {
    id: 'trend-4',
    category: 'Health',
    headline: 'New treatment shows promise in disease recovery',
    article: 'Clinical trial investigators in a phase III multisite oncology study published striking findings for an engineered immunotherapy compound. Over eighty percent of participating patients exhibited substantial cellular remission within twelve weeks, with minimal immunological adverse effects observed.',
    timestamp: '5h ago',
    imageUrl: medicalImg
  },
  {
    id: 'trend-5',
    category: 'Science',
    headline: 'Scientists discover new planet beyond solar system',
    article: 'Astrophysicists utilizing high-resolution orbital coronagraph spectrometers have confirmed the detection of a rocky exoplanet orbiting within the circumstellar habitable zone of a nearby G-type star. Atmospheric spectroscopy indicates traces of water vapor, methane, and atmospheric nitrogen.',
    timestamp: '6h ago',
    imageUrl: spaceImg
  },
  {
    id: 'trend-6',
    category: 'Climate',
    headline: 'Global leaders meet to discuss climate action',
    article: 'Ministers and heads of state from seventy-five countries convened at the annual climate diplomacy summit to finalize binding carbon border adjustments and capital replenishment for global adaptation funds. Delegates emphasized the urgency of accelerating decarbonization targets before the decade concludes.',
    timestamp: '8h ago',
    imageUrl: climateImg
  }
];
