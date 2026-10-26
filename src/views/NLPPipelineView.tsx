import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Ban,
  BookOpen,
  CaseSensitive,
  Layers,
  Loader2,
  Scissors,
  Sparkles,
  Split,
} from 'lucide-react';
import { inspectNlpPipeline, PipelineInspectionResult } from '../utils/predictionApi';

const STOPWORDS = new Set(
  'a about above after again against all am an and any are aren as at be because been before being below between both but by can could did didn do does doesn doing don down during each few for from further had hadn has hasn have haven having he her here hers herself him himself his how i if in into is isn it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own re s same she should shouldn so some such t than that the their theirs them themselves then there these they this those through to too under until up very was wasn we were weren what when where which while who whom why will with won would you your yours yourself yourselves'.split(' ')
);

const IRREGULAR_LEMMAS: Record<string, string> = {
  children: 'child', feet: 'foot', geese: 'goose', men: 'man', mice: 'mouse',
  people: 'person', teeth: 'tooth', women: 'woman', better: 'good', best: 'good',
  went: 'go', gone: 'go', was: 'be', were: 'be', is: 'be', are: 'be', am: 'be',
  has: 'have', had: 'have', did: 'do', done: 'do',
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/https?:\/\/\S+|www\.\S+/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return text.match(/[\p{L}\p{N}]+/gu) ?? [];
}

function stemToken(token: string): string {
  let stem = token;

  if (stem.length > 5 && stem.endsWith('ing')) {
    stem = stem.slice(0, -3);
    if (/(.)\1$/.test(stem)) stem = stem.slice(0, -1);
  } else if (stem.length > 4 && stem.endsWith('ied')) {
    stem = `${stem.slice(0, -3)}i`;
  } else if (stem.length > 4 && stem.endsWith('ed')) {
    stem = stem.slice(0, -2);
    if (/(.)\1$/.test(stem)) stem = stem.slice(0, -1);
  } else if (stem.length > 4 && stem.endsWith('ies')) {
    stem = `${stem.slice(0, -3)}i`;
  } else if (stem.length > 4 && stem.endsWith('es')) {
    stem = stem.slice(0, -2);
  } else if (stem.length > 3 && stem.endsWith('s') && !stem.endsWith('ss')) {
    stem = stem.slice(0, -1);
  }

  if (stem.length > 5 && stem.endsWith('ly')) stem = stem.slice(0, -2);
  return stem;
}

function lemmatizeToken(token: string): string {
  const irregularLemma = IRREGULAR_LEMMAS[token];
  if (irregularLemma) return irregularLemma;

  if (token.length > 4 && token.endsWith('ied')) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith('ing')) {
    let lemma = token.slice(0, -3);
    if (/(.)\1$/.test(lemma)) lemma = lemma.slice(0, -1);
    if (lemma.endsWith('mak')) return `${lemma.slice(0, -1)}e`;
    if (lemma === 'comput') return 'compute';
    if (lemma === 'accelerat') return 'accelerate';
    return lemma;
  }
  if (token.length > 4 && token.endsWith('ed')) {
    let lemma = token.slice(0, -2);
    if (/(.)\1$/.test(lemma)) lemma = lemma.slice(0, -1);
    if (/[ct]$/.test(lemma)) lemma += 'e';
    return lemma;
  }
  if (token.length > 4 && token.endsWith('ves')) {
    if (token.endsWith('ives')) return `${token.slice(0, -3)}fe`;
    return `${token.slice(0, -3)}f`;
  }
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }
  return token;
}

function TokenList({ tokens, emptyLabel }: { tokens: string[]; emptyLabel: string }) {
  if (tokens.length === 0) {
    return <p className="text-xs text-slate-400">{emptyLabel}</p>;
  }

  return (
    <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
      {tokens.map((token, index) => (
        <span key={`${token}-${index}`} className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-700">
          {token}
        </span>
      ))}
    </div>
  );
}

function Stage({
  number,
  title,
  description,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-5 last:border-b-0">
      <div className="grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold text-slate-900">{number}. {title}</h2>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

export const NLPPipelineView: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Scientists and AI researchers have announced breakthroughs in computing processors, accelerating machine learning algorithms by 40% across distributed server clusters.'
  );

  const [pipelineData, setPipelineData] = useState<PipelineInspectionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const pipeline = useMemo(() => {
    const cleanedText = normalizeText(inputText);
    const tokens = tokenize(cleanedText);
    const removedStopwords = tokens.filter((token) => STOPWORDS.has(token));
    const contentTokens = tokens.filter((token) => !STOPWORDS.has(token));

    return {
      cleanedText,
      tokens,
      removedStopwords,
      contentTokens,
      stems: contentTokens.map(stemToken),
      lemmas: contentTokens.map(lemmatizeToken),
    };
  }, [inputText]);

  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed || trimmed.length < 5) {
      setPipelineData(null);
      setPipelineError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setPipelineError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const result = await inspectNlpPipeline(trimmed);
        if (isMounted) {
          setPipelineData(result);
          setPipelineError(null);
        }
      } catch (err) {
        if (isMounted) {
          setPipelineError(err instanceof Error ? err.message : 'Unable to inspect backend pipeline');
          setPipelineData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [inputText]);

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200/80 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">NLP Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore each text transformation, live TF-IDF vector features, and model classification.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <label htmlFor="pipeline-input" className="mb-2 block text-xs font-semibold text-slate-700">
          Input text
        </label>
        <textarea
          id="pipeline-input"
          rows={4}
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          placeholder="Paste or type text to inspect..."
        />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Characters: {inputText.length}</span>
          <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white px-5 sm:px-6">
        <Stage number="1" title="Normalize and clean" description="Lowercase, remove URLs/markup/punctuation, normalize spaces" icon={Sparkles}>
          <p className="break-words rounded-lg bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700">
            {pipeline.cleanedText || '(empty text)'}
          </p>
        </Stage>

        <Stage number="2" title="Tokenize" description={`${pipeline.tokens.length} tokens`} icon={Split}>
          <TokenList tokens={pipeline.tokens} emptyLabel="No tokens found." />
        </Stage>

        <Stage number="3" title="Remove stopwords" description={`${pipeline.removedStopwords.length} removed, ${pipeline.contentTokens.length} kept`} icon={Ban}>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase text-slate-500">Removed</p>
              <TokenList tokens={pipeline.removedStopwords} emptyLabel="No stopwords found." />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase text-slate-500">Remaining tokens</p>
              <TokenList tokens={pipeline.contentTokens} emptyLabel="No content tokens remain." />
            </div>
          </div>
        </Stage>

        <Stage number="4" title="Stem and lemmatize" description="Alternative word-reduction previews from the remaining tokens" icon={BookOpen}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Scissors className="h-3.5 w-3.5 text-rose-600" />
                Stemmed forms
              </h3>
              <TokenList tokens={pipeline.stems} emptyLabel="No stems to show." />
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <CaseSensitive className="h-3.5 w-3.5 text-teal-700" />
                Lemmatized forms
              </h3>
              <TokenList tokens={pipeline.lemmas} emptyLabel="No lemmas to show." />
            </div>
          </div>
        </Stage>

        <Stage
          number="5"
          title="TF-IDF vectorization"
          description={
            pipelineData
              ? `${pipelineData.matched_terms_count} active features • Fitted vocabulary (18,249 features)`
              : 'Fitted vectorizer (18,249 unigram & bigram features)'
          }
          icon={Layers}
        >
          {isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
              <span>Extracting TF-IDF n-gram feature weights...</span>
            </div>
          )}

          {!isLoading && pipelineError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">Pipeline Note</p>
              <p className="mt-0.5">{pipelineError}</p>
            </div>
          )}

          {!isLoading && !pipelineError && !pipelineData && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              Enter at least 5 characters to view active TF-IDF vector features.
            </div>
          )}

          {!isLoading && pipelineData && (
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Layers className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Active TF-IDF Terms & N-Grams</span>
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                  {pipelineData.matched_terms_count} active terms / {pipelineData.total_vocab_size.toLocaleString()} vocabulary
                </span>
              </div>

              {pipelineData.tfidf_terms.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  None of the tokens in the input matched the model's vocabulary.
                </p>
              ) : (
                <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  {pipelineData.tfidf_terms.map((item, index) => (
                    <div
                      key={`${item.term}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-2xs"
                    >
                      <span className="font-mono font-medium text-slate-800">{item.term}</span>
                      {item.is_ngram && (
                        <span className="rounded bg-indigo-50 px-1 text-[10px] font-semibold text-indigo-700">
                          2-gram
                        </span>
                      )}
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[11px] font-semibold text-blue-700">
                        {item.score.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Stage>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <ArrowDown className="h-4 w-4" />
        <span>Preprocessed text flows into the fitted TF-IDF vectorizer.</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Transforms text into numerical feature vectors matching the 18,249-dimension vocabulary.</span>
      </div>
    </div>
  );
};
