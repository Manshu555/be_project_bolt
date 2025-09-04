const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIModel {
  id: string;
  name: string;
  endpoint: string;
  description: string;
}

export interface PredictionRequest {
  symbol: string;
  currentPrice: number;
  historicalData: any[];
  marketContext: string;
}

export interface AIPrediction {
  model: string;
  prediction: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  targetPrice: number;
  timeframe: string;
  reasoning: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-oss-120b',
    name: 'GPT OSS 120B',
    endpoint: 'openai/gpt-oss-120b:free',
    description: 'Advanced language model for financial analysis'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    endpoint: 'google/gemini-2.5-flash-image-preview:free',
    description: 'Google\'s latest multimodal AI for market insights'
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small 3.2',
    endpoint: 'mistralai/mistral-small-3.2-24b-instruct:free',
    description: 'Efficient model for quick financial predictions'
  }
];

const createPredictionPrompt = (request: PredictionRequest): string => {
  return `You are a professional financial analyst AI. Analyze the following stock and provide a prediction.

Stock Symbol: ${request.symbol}
Current Price: $${request.currentPrice}
Market Context: ${request.marketContext}

Based on the provided information, please provide:
1. Your prediction (Bullish/Bearish/Neutral)
2. Confidence level (0-100%)
3. Target price for next week
4. Risk level (Low/Medium/High)
5. Brief reasoning (2-3 sentences)

Respond in this exact JSON format:
{
  "prediction": "Bullish|Bearish|Neutral",
  "confidence": 85,
  "targetPrice": 185.50,
  "riskLevel": "Medium",
  "reasoning": "Your analysis here..."
}

Important: Only respond with valid JSON. Do not include any other text.`;
};

export const getPredictionFromModel = async (
  model: AIModel, 
  request: PredictionRequest
): Promise<AIPrediction> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Stock Predictor'
      },
      body: JSON.stringify({
        model: model.endpoint,
        messages: [
          {
            role: 'user',
            content: createPredictionPrompt(request)
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content received');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      parsedResponse = {
        prediction: 'Neutral',
        confidence: 50,
        targetPrice: request.currentPrice,
        riskLevel: 'Medium',
        reasoning: 'Unable to parse AI response properly.'
      };
    }

    return {
      model: model.name,
      prediction: parsedResponse.prediction || 'Neutral',
      confidence: Math.min(100, Math.max(0, parsedResponse.confidence || 50)),
      targetPrice: parsedResponse.targetPrice || request.currentPrice,
      timeframe: '1 Week',
      reasoning: parsedResponse.reasoning || 'Analysis completed.',
      riskLevel: parsedResponse.riskLevel || 'Medium'
    };
  } catch (error) {
    console.error(`Error getting prediction from ${model.name}:`, error);
    
    // Return fallback prediction
    return {
      model: model.name,
      prediction: 'Neutral',
      confidence: 0,
      targetPrice: request.currentPrice,
      timeframe: '1 Week',
      reasoning: `Error: Unable to get prediction from ${model.name}. ${error instanceof Error ? error.message : 'Unknown error'}`,
      riskLevel: 'High'
    };
  }
};

export const getAllPredictions = async (request: PredictionRequest): Promise<AIPrediction[]> => {
  const predictions = await Promise.all(
    AI_MODELS.map(model => getPredictionFromModel(model, request))
  );
  
  return predictions;
};