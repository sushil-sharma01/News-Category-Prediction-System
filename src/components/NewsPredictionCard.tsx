import React, { useState } from 'react';
import { Sparkles, Send, RotateCcw, Info, BarChart3, CheckCircle2, FileUp } from 'lucide-react';
import { PredictionResult } from '../types/news';
import { predictCategory } from '../utils/predictionApi';
import { DOCUMENT_ACCEPT, extractDocumentText } from '../utils/documentText';
import { getCategoryBadgeStyle } from '../data/categoriesData';

interface NewsPredictionCardProps {
  initialHeadline?: string;
  initialArticle?: string;
  onPredictionComplete?: (result: PredictionResult) => void;
}

export const NewsPredictionCard: React.FC<NewsPredictionCardProps> = ({
  initialHeadline = '',
  initialArticle = '',
  onPredictionComplete
}) => {
  const [headline, setHeadline] = useState(initialHeadline);
  const [articleText, setArticleText] = useState(initialArticle);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [error, setError] = useState('');

  // Sync if initial props change (e.g. user clicked a trending news article)
  React.useEffect(() => {
    if (initialHeadline || initialArticle) {
      setHeadline(initialHeadline);
      setArticleText(initialArticle);
      handleClassify(initialHeadline, initialArticle);
    }
  }, [initialHeadline, initialArticle]);

  const wordCount = React.useMemo(() => {
    const combined = `${headline} ${articleText}`.trim();
    if (!combined) return 0;
    return combined.split(/\s+/).filter(Boolean).length;
  }, [headline, articleText]);

  const handleClassify = async (hl = headline, art = articleText) => {
    if (!hl.trim() && !art.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (art.trim().length < 5) {
        throw new Error('Please enter at least 5 characters of article text.');
      }

      const result = await predictCategory(hl, art);
      setPrediction(result);
      if (onPredictionComplete) {
        onPredictionComplete(result);
      }
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHeadline('');
    setArticleText('');
    setFileError('');
    setUploadedFileName('');
    setPrediction(null);
    setError('');
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setFileLoading(true);
    setFileError('');
    setUploadedFileName('');
    setError('');

    try {
      const extractedText = await extractDocumentText(file);
      setArticleText(extractedText);
      setPrediction(null);
      setUploadedFileName(file.name);
    } catch (uploadError) {
      setFileError(uploadError instanceof Error ? uploadError.message : 'Could not read this document.');
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-start gap-3 pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Predict News Category
            </h2>
            <p className="text-xs text-slate-500">
              Enter a headline or article to classify it using our NLP pipeline.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Headline <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter news headline..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/40"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Article Text
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                <FileUp className="w-3.5 h-3.5 text-blue-600" />
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
            {uploadedFileName && !fileError && (
              <p className="text-[11px] text-slate-500 mb-1.5 truncate" title={uploadedFileName}>
                Imported: {uploadedFileName}
              </p>
            )}
            {fileError && (
              <p className="text-[11px] text-red-600 mb-1.5" role="alert">
                {fileError}
              </p>
            )}
            <div className="relative">
              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                rows={4}
                placeholder="Paste your news article here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y min-h-[110px] bg-slate-50/40"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] font-mono tabular-nums text-slate-400 pointer-events-none">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => handleClassify()}
              disabled={loading || articleText.trim().length < 5}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing NLP...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Predict Category</span>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        {!prediction ? (
          /* Empty State */
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Your prediction results will appear here
              </p>
              <p className="text-xs text-slate-500">
                Enter a headline or article and click &ldquo;Predict Category&rdquo;
              </p>
            </div>
          </div>
        ) : (
          /* Populated Prediction Result */
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-4 space-y-4">
            {/* Primary Category & Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prediction
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                    getCategoryBadgeStyle(prediction.category).bg
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {prediction.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Confidence</span>
                <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  {prediction.confidence.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(prediction.confidence, 100)}%` }}
              ></div>
            </div>

            {/* Top 3 Predictions Breakdown */}
            <div className="pt-1">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Top Predictions
              </p>
              <div className="space-y-2">
                {prediction.topPredictions.map((item, idx) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-32">
                      <span className="text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                      <span className="font-medium text-slate-800">{item.category}</span>
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            idx === 0 ? 'bg-blue-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${item.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-slate-700 font-medium text-right w-12">
                      {item.confidence.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* NLP Pipeline Trace Accordion */}
            <div className="pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setShowModelDetails(!showModelDetails)}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>
                  {showModelDetails ? 'Hide' : 'View'} Backend Details
                </span>
              </button>

              {showModelDetails && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Confidence level:</span>
                    <span className="text-slate-900 font-semibold">{prediction.confidenceLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-1">Related categories:</span>
                    <div className="flex flex-wrap gap-1">
                      {prediction.relatedCategories.map((item) => (
                        <span key={item.category} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.category} ({item.confidence.toFixed(1)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-1">Preprocessed text:</span>
                    <p className="text-slate-900 whitespace-normal">{prediction.cleanedText}</p>
                  </div>
                  <div className="font-sans text-slate-600">
                    {prediction.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-xs text-red-600" role="alert">{error}</p>}
      </div>
    </div>
  );
};
