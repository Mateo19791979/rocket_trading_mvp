import OpenAI from 'openai';

/**
 * OpenAI Client Configuration
 * Configured for RAG system and AI knowledge processing
 */
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage in React
});

/**
 * Validate OpenAI connection and API key
 * @returns {Promise<boolean>} Connection status
 */
export const validateOpenAIConnection = async () => {
  try {
    await openai?.models?.list();
    return true;
  } catch (error) {
    console.error('OpenAI connection validation failed:', error);
    return false;
  }
};

/**
 * Get available models for embedding and chat
 * @returns {Promise<Object>} Available models
 */
export const getAvailableModels = async () => {
  try {
    const response = await openai?.models?.list();
    const models = response?.data || [];
    
    return {
      embedding_models: models?.filter(m => m?.id?.includes('embedding')),
      chat_models: models?.filter(m => m?.id?.includes('gpt')),
      all_models: models
    };
  } catch (error) {
    console.error('Error fetching models:', error);
    return { embedding_models: [], chat_models: [], all_models: [] };
  }
};

export default openai;