import React from 'react';
import { Brain, Target, Clock, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import type { Stock } from './StockSearch';
import type { Prediction } from './AIPredictor';

interface PredictionComparisonProps {
  predictions: Prediction[];
  stock: Stock;
}

const PredictionComparison: React.FC<PredictionComparisonProps> = ({ predictions, stock }) => {
  if (predictions.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Model Comparison</h3>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-300 mb-2">No Predictions Yet</h4>
          <p className="text-slate-400">Generate AI predictions to see comparative analysis here.</p>
        </div>
      </div>
    );
  }

  const consensusDirection = () => {
    const bullish = predictions.filter(p => p.prediction === 'Bullish').length;
    const bearish = predictions.filter(p => p.prediction === 'Bearish').length;
    const neutral = predictions.filter(p => p.prediction === 'Neutral').length;
    
    if (bullish > bearish && bullish > neutral) return 'Bullish';
    if (bearish > bullish && bearish > neutral) return 'Bearish';
    return 'Mixed';
  };

  const averageConfidence = predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length;
  const averageTarget = predictions.reduce((acc, p) => acc + p.targetPrice, 0) / predictions.length;
  const consensus = consensusDirection();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Model Comparison</h3>
        </div>
        <div className="text-xs text-slate-400">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Consensus Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Consensus</span>
          </div>
          <div className={`text-lg font-bold ${
            consensus === 'Bullish' ? 'text-green-400' :
            consensus === 'Bearish' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {consensus === 'Bullish' && <TrendingUp className="w-5 h-5 inline mr-2" />}
            {consensus === 'Bearish' && <TrendingDown className="w-5 h-5 inline mr-2" />}
            {consensus === 'Mixed' && <Minus className="w-5 h-5 inline mr-2" />}
            {consensus}
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Avg Confidence</span>
          </div>
          <div className="text-lg font-bold text-white">{averageConfidence.toFixed(1)}%</div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Avg Target</span>
          </div>
          <div className="text-lg font-bold text-white">${averageTarget.toFixed(2)}</div>
        </div>
      </div>

      {/* Individual Predictions */}
      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">{prediction.model}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  prediction.prediction === 'Bullish' ? 'bg-green-500/20 text-green-400' :
                  prediction.prediction === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {prediction.prediction}
                </div>
                <div className="text-sm text-slate-300">
                  {prediction.confidence}% confidence
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-slate-400">Target Price:</span>
                <span className="text-white ml-2 font-medium">${prediction.targetPrice.toFixed(2)}</span>
                <span className={`ml-2 text-xs ${
                  prediction.targetPrice > stock.price ? 'text-green-400' : 'text-red-400'
                }`}>
                  ({((prediction.targetPrice / stock.price - 1) * 100).toFixed(1)}%)
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400">Timeframe:</span>
                <span className="text-white ml-2 font-medium">{prediction.timeframe}</span>
              </div>
            </div>
            
            <div className="mb-3">
              <span className="text-xs text-slate-400">Risk Level:</span>
              <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                prediction.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                prediction.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {prediction.riskLevel}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">{prediction.reasoning}</p>
          </div>
        ))}
      </div>

      {predictions.length > 0 && (
        <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/20">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">Disclaimer</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI predictions are for informational purposes only and should not be considered as financial advice. 
            Past performance does not guarantee future results. Always consult with a financial advisor.
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionComparison;