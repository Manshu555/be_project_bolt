import React, { useState } from 'react';
import { Brain, Zap, Sparkles, Bot, Play, Loader2 } from 'lucide-react';
import { getAllPredictions, AI_MODELS } from '../services/aiApi';
import type { Stock } from './StockSearch';

export interface Prediction {
  model: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  targetPrice: number;
  timeframe: string;
  riskLevel: string;
}

interface AIPredictorProps {
  stock: Stock;
  onPredictionsUpdate: (predictions: Prediction[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AIPredictor: React.FC<AIPredictorProps> = ({ 
  stock, 
  onPredictionsUpdate, 
  isLoading, 
  setIsLoading 
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4', 'gemini', 'claude']);

  const models = [
    { id: 'gpt-oss-120b', name: 'GPT OSS 120B', icon: <Brain className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', icon: <Sparkles className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'mistral-small', name: 'Mistral Small 3.2', icon: <Zap className="w-4 h-4" />, color: 'text-purple-400' },
  ];

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const generatePredictions = async () => {
    setIsLoading(true);
    
    try {
      const predictionRequest = {
        symbol: stock.symbol,
        currentPrice: stock.price,
        historicalData: [], // Could be populated with chart data
        marketContext: `Current market conditions for ${stock.name} (${stock.symbol}). Recent change: ${stock.changePercent.toFixed(2)}%`
      };

      const aiPredictions = await getAllPredictions(predictionRequest);
      
      // Filter predictions based on selected models
      const filteredPredictions = aiPredictions.filter(pred => 
        selectedModels.some(modelId => {
          const model = AI_MODELS.find(m => m.id === modelId);
          return model && pred.model === model.name;
        })
      );
      
      onPredictionsUpdate(filteredPredictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
      onPredictionsUpdate([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Predictions</h3>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Select AI Models</h4>
        <div className="grid grid-cols-2 gap-2">
          {models.map((model) => (
            <label key={model.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModels.includes(model.id)}
                onChange={() => handleModelToggle(model.id)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <span className={model.color}>{model.icon}</span>
                <span className="text-sm text-white">{model.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* API Key Notice */}
      <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <h4 className="text-sm font-medium text-green-400 mb-2">AI Models Ready</h4>
        <p className="text-xs text-amber-300">
          Connected to OpenRouter AI models. Real predictions will be generated using live market data.
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePredictions}
        disabled={selectedModels.length === 0 || isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        <span>
          {isLoading ? 'Analyzing...' : `Get Predictions (${selectedModels.length} models)`}
        </span>
      </button>

      {/* Quick Tip */}
      <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
        <p className="text-xs text-slate-400">
          💡 <strong>Tip:</strong> AI predictions are for educational purposes only. Always conduct your own research and consider multiple factors before making investment decisions.
        </p>
      </div>
    </div>
  );
};

export default AIPredictor;