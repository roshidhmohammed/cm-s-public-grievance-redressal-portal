const aiConfig = {
  provider: process.env.AI_PROVIDER || '',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || ''
};

export default aiConfig;
