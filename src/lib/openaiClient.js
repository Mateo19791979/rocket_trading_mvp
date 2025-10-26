import OpenAI from 'openai';

/**
 * OpenAI Client Configuration for Freedom v4 Cognitive Engine
 * Optimized for cognitive learning and cross-domain analysis
 */
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage in React
});

export { openai };
export default openai;