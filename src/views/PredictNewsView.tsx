import React, { useState } from 'react';
import { 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  BarChart3, 
  BookOpen, 
  FileUp, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { predictCategory } from '../utils/predictionApi';
import { DOCUMENT_ACCEPT, extractDocumentText } from '../utils/documentText';
import { PredictionResult } from '../types/news';
import { getCategoryBadgeStyle } from '../data/categoriesData';
import { TRENDING_NEWS } from '../data/trendingNewsData';

export const PredictNewsView: React.FC = () => {
  const [headline, setHeadline] = useState('');
  const [articleText, setArticleText] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState(false);

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setFileLoading(true);
    setError(null);
    setUploadedFileName('');
    setPrediction(null);
    try {
      const extractedText = await extractDocumentText(file);
      setArticleText(extractedText);
      setPrediction(null);
      setUploadedFileName(file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not read this document.');
    } finally {
      setFileLoading(false);
    }
  };

  const handlePredict = async () => {
    if (articleText.trim().length < 5) {
      setError('Please enter at least 5 characters of article text.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await predictCategory(headline, articleText);
      setPrediction(result);
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : 'Prediction failed. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHeadline('');
    setArticleText('');
    setPrediction(null);
    setUploadedFileName('');
    setError(null);
  };

  const loadSample = async (index: number) => {
    const item = TRENDING_NEWS[index % TRENDING_NEWS.length];
    setHeadline(item.headline);
    setArticleText(item.article);
    setUploadedFileName('');
    setLoading(true);
    setError(null);
    try {
      setPrediction(await predictCategory(item.headline, item.article));
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : 'Prediction failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = articleText.split(/\s+/).filter(Boolean).length;
  const cleanedTokens = prediction?.cleanedText ? prediction.cleanedText.split(' ').filter(Boolean) : [];

  return (
    <div className="space-y-6">
      {/* View Header with Sample Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Predict News Category
          </h1>
          <p className="text-sm text-slate-500">
            Run real-time TF-IDF vectorization and Logistic Regression inference on any news text.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-600 mr-1">Load Demo Sample:</span>
          {[
            { label: 'Technology', idx: 0, style: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
            { label: 'Sports', idx: 1, style: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200' },
            { label: 'Business', idx: 2, style: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
            { label: 'Health', idx: 3, style: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' },
            { label: 'Science', idx: 4, style: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
            { label: 'Climate', idx: 5, style: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
          ].map((sample) => (
            <button
              key={sample.label}
              onClick={() => loadSample(sample.idx)}
              disabled={loading}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${sample.style}`}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              News Headline <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Breakthrough AI accelerator reduces inference latency by 40%"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/40"
            />
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="news-article" className="block text-xs font-semibold text-slate-700">
                News Article Body <span className="text-rose-500">*</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <FileUp className="h-3.5 w-3.5 text-blue-600" />
                <span>{fileLoading ? 'Reading document...' : 'Import PDF or DOCX'}</span>
                <input
                  type="file"
                  accept={DOCUMENT_ACCEPT}
                  onChange={handleDocumentUpload}
                  disabled={fileLoading}
                  className="sr-only"
                />
              </label>
            </div>
            {uploadedFileName && (
              <p className="mb-1.5 truncate text-[11px] text-blue-600 font-medium" title={uploadedFileName}>
                ✓ Imported file: {uploadedFileName}
              </p>
            )}
            <textarea
              id="news-article"
              rows={8}
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste news article content here (at least 5 characters)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/40"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1.5 font-mono">
              <span>Supports full-length articles &amp; headlines</span>
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePredict}
              disabled={loading || fileLoading || articleText.trim().length < 5}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Classifying...' : 'Predict Category'}</span>
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Clear</span>
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          {!prediction ? (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Awaiting News Input
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                Type or paste an article on the left, import a document, or choose one of the verified demo samples above.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Classification Output
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {prediction.confidenceLevel} Confidence
                </span>
              </div>

              {/* Primary Label */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">Predicted Category</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-base font-bold border shadow-xs ${
                      getCategoryBadgeStyle(prediction.category).bg
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {prediction.category}
                  </span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {prediction.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, prediction.confidence))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0%</span>
                  <span>Model Confidence Estimate</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Top Probabilities */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Top Class Probabilities
                </p>
                <div className="space-y-1.5">
                  {prediction.topPredictions.map((p, idx) => (
                    <div key={p.category} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px] w-4">{idx + 1}.</span>
                        <span className="font-medium text-slate-800">{p.category}</span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-600 font-semibold">
                        {p.confidence.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Categories & Notes */}
              {prediction.relatedCategories.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notable Secondary Classes</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {prediction.relatedCategories.map((item) => (
                      <span key={item.category} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono">
                        {item.category}: {item.confidence.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Preprocessed NLP Tokens Inspection */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preprocessed NLP Tokens ({cleanedTokens.length})</span>
                  </span>
                  {showTokens ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showTokens && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 max-h-40 overflow-y-auto">
                    <p className="text-[10px] text-slate-500 mb-2">
                      Tokens after punctuation normalization, stopword removal, and vocabulary mapping:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cleanedTokens.map((token, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
