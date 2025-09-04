import React from 'react';
import { Trophy, TrendingUp, Target, Calendar } from 'lucide-react';

const PredictionAccuracy: React.FC = () => {
  const modelAccuracy = [
    { model: 'GPT-4', accuracy: 68, predictions: 45, wins: 31, color: 'text-green-400' },
    { model: 'Gemini Pro', accuracy: 72, predictions: 38, wins: 27, color: 'text-blue-400' },
    { model: 'Claude 3', accuracy: 65, predictions: 42, wins: 27, color: 'text-purple-400' },
    { model: 'Llama 2', accuracy: 61, predictions: 35, wins: 21, color: 'text-orange-400' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Model Performance</h3>
      </div>

      <div className="space-y-4">
        {modelAccuracy.map((model, index) => (
          <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white">{model.model}</span>
              <span className={`text-sm font-bold ${model.color}`}>{model.accuracy}%</span>
            </div>
            
            <div className="w-full bg-slate-600/50 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${
                  model.accuracy > 70 ? 'from-green-500 to-green-400' :
                  model.accuracy > 60 ? 'from-yellow-500 to-yellow-400' :
                  'from-red-500 to-red-400'
                }`}
                style={{ width: `${model.accuracy}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-slate-400">
              <span>{model.wins}/{model.predictions} correct</span>
              <span>Last 30 days</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/20">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Performance Tracking</span>
        </div>
        <p className="text-xs text-slate-400">
          Accuracy is calculated based on predictions made in the last 30 days. 
          A prediction is considered correct if the stock moved in the predicted direction within the specified timeframe.
        </p>
      </div>
    </div>
  );
};

export default PredictionAccuracy;