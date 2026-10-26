import React, { useState } from 'react';
import { 
  GitBranch, 
  FileText, 
  Sparkles, 
  LayoutGrid, 
  Ban, 
  Scissors,
  Leaf, 
  BarChart2, 
  Cpu, 
  Tag, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface NLPPipelineProps {
  onExplore?: () => void;
}

interface PipelineStep {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  description: string;
  details: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'input',
    name: 'News Input',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50/80 border-blue-100',
    description: 'Raw headline and article text',
    details: 'Text fields are combined before being sent to the prediction service.'
  },
  {
    id: 'cleaning',
    name: 'Text Cleaning',
    icon: Sparkles,
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50/80 border-teal-100',
    description: 'Normalize text for processing',
    details: 'The preview lowercases text, removes URLs and markup, strips punctuation, and normalizes spaces.'
  },
  {
    id: 'tokenization',
    name: 'Tokenization',
    icon: LayoutGrid,
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50/80 border-cyan-100',
    description: 'Split normalized text into tokens',
    details: 'The preview separates the cleaned text into individual words and numbers.'
  },
  {
    id: 'stopwords',
    name: 'Stopword Removal',
    icon: Ban,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50/80 border-purple-100',
    description: 'Filter common English stopwords',
    details: 'The preview shows which common words are removed and which tokens remain.'
  },
  {
    id: 'stemming',
    name: 'Stemming',
    icon: Scissors,
    iconColor: 'text-rose-600',
    bgColor: 'bg-rose-50/80 border-rose-100',
    description: 'Reduce word endings with suffix rules',
    details: 'The live inspector shows a rule-based stem preview for the remaining tokens.'
  },
  {
    id: 'lemmatization',
    name: 'Lemmatization',
    icon: Leaf,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50/80 border-emerald-100',
    description: 'Map word forms to base forms',
    details: 'The live inspector shows a separate rule-based lemma preview; it is not the trained model output.'
  },
  {
    id: 'tfidf',
    name: 'TF-IDF',
    icon: BarChart2,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50/80 border-indigo-100',
    description: 'Weight terms with the fitted vectorizer',
    details: 'The backend transforms preprocessed text using the vocabulary learned during model training.'
  },
  {
    id: 'svm',
    name: 'Classifier',
    icon: Cpu,
    iconColor: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50/80 border-fuchsia-100',
    description: 'Score text against trained categories',
    details: 'The backend loads the saved classifier and produces category confidence values.'
  },
  {
    id: 'category',
    name: 'Prediction',
    icon: Tag,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50/80 border-emerald-100',
    description: 'Return ranked category predictions',
    details: 'The API returns the primary category, confidence level, related categories, and top predictions.'
  }
];

export const NLPPipeline: React.FC<NLPPipelineProps> = ({ onExplore }) => {
  const [activeStep, setActiveStep] = useState<PipelineStep | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              NLP Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Follow text preprocessing, then inspect the backend prediction stages.
            </p>
          </div>
        </div>

        <button
          onClick={onExplore}
          type="button"
          className="self-start sm:self-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
        >
          Explore NLP Pipeline
        </button>
      </div>

      {/* Horizontal Connected Pipeline */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[860px] flex items-center justify-between gap-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === PIPELINE_STEPS.length - 1;
            const isSelected = activeStep?.id === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Node Box */}
                <div
                  onClick={() => setActiveStep(isSelected ? null : step)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer w-28 shrink-0 hover:scale-102 ${
                    step.bgColor
                  } ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-sm' : 'hover:shadow-xs'
                  }`}
                  title="Click for stage specifications"
                >
                  <div className={`w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center mb-2 ${step.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                    {step.name}
                  </span>
                </div>

                {/* Arrow Connector */}
                {!isLast && (
                  <div className="text-slate-300 px-1 shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Interactive Step Details Inspector */}
      {activeStep && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h4 className="text-xs font-bold text-slate-900">
                {activeStep.name} Stage Architecture
              </h4>
            </div>
            <button
              onClick={() => setActiveStep(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1">{activeStep.description}</p>
          <div className="mt-2 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800">
            {activeStep.details}
          </div>
        </div>
      )}
    </div>
  );
};
