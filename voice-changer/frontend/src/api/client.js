import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Train a new model by analyzing text corpus
 * @param {string} corpus - The text corpus to analyze
 * @returns {Promise<{success: boolean, report_id: string, message: string}>}
 */
export const trainModel = async (corpus) => {
  const response = await apiClient.post('/api/train', { corpus });
  return response.data;
};

/**
 * Save a trained model with a name
 * @param {string} reportId - The temporary report ID
 * @param {string} modelName - The desired model name
 * @returns {Promise<{success: boolean, model_name: string}>}
 */
export const saveModel = async (reportId, modelName) => {
  const response = await apiClient.post('/api/save-model', {
    report_id: reportId,
    model_name: modelName,
  });
  return response.data;
};

/**
 * Get list of all trained models
 * @returns {Promise<Array<{name: string, created_at: string, file_path: string}>>}
 */
export const getModels = async () => {
  const response = await apiClient.get('/api/models');
  return response.data;
};

/**
 * Transform text using a trained model
 * @param {string} modelName - The name of the model to use
 * @param {string} text - The text to transform
 * @returns {Promise<{transformed_text: string}>}
 */
export const transformText = async (modelName, text) => {
  const response = await apiClient.post('/api/transform', {
    model_name: modelName,
    text,
  });
  return response.data;
};

/**
 * Delete a trained model
 * @param {string} modelName - The name of the model to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteModel = async (modelName) => {
  const response = await apiClient.delete(`/api/models/${modelName}`);
  return response.data;
};

// PDF-related functions

/**
 * Extract text from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<{text: string, pages: number, paragraph_count: number}>}
 */
export const extractPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/extract-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Train a model from a PDF file
 * @param {File} file - The PDF file to use as corpus
 * @returns {Promise<{success: boolean, report_id: string, message: string}>}
 */
export const trainModelFromPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/train-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Transform PDF using a trained model
 * @param {File} file - The PDF file to transform
 * @param {string} modelName - The name of the model to use
 * @param {string} outputFormat - "text" or "pdf"
 * @returns {Promise<any>} - Text object or Blob for PDF
 */
export const transformPdf = async (file, modelName, outputFormat = 'text') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_name', modelName);
  formData.append('output_format', outputFormat);

  if (outputFormat === 'pdf') {
    const response = await axios.post(`${API_BASE_URL}/api/transform-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response.data;
  } else {
    const response = await axios.post(`${API_BASE_URL}/api/transform-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Character-related functions

/**
 * Search for famous characters matching a query
 * @param {string} query - The character name or type to search for
 * @returns {Promise<{characters: Array, count: number}>}
 */
export const searchCharacters = async (query) => {
  const response = await apiClient.post('/api/search-characters', { query });
  return response.data;
};

/**
 * Train a model from a famous character using LLM's knowledge
 * @param {string} name - Character name
 * @param {string} description - Character description
 * @param {string} source - Source work/franchise
 * @returns {Promise<{success: boolean, report_id: string, message: string}>}
 */
export const trainFromCharacter = async (name, description, source) => {
  const response = await apiClient.post('/api/train-from-character', {
    name,
    description,
    source,
  });
  return response.data;
};

// Preview-related functions

/**
 * Get 3 example transformations using a temporary report (before saving)
 * @param {string} reportId - Temporary report ID from /api/train or /api/train-pdf
 * @param {string[]} [prompts] - Optional custom prompts (max 3)
 * @returns {Promise<{examples: string[]}>}
 */
export const getTrainingExamples = async (reportId, prompts) => {
  const response = await apiClient.post('/api/training-examples', {
    report_id: reportId,
    prompts,
  });
  return response.data;
};

/**
 * Preview a character model without saving: returns report_id and 3 examples
 * @param {string} name
 * @param {string} description
 * @param {string} source
 * @param {string[]} [prompts]
 * @returns {Promise<{report_id: string, examples: string[]}>}
 */
export const getCharacterPreview = async (name, description, source, prompts) => {
  const response = await apiClient.post('/api/character-preview', {
    name,
    description,
    source,
    prompts,
  });
  return response.data;
};

export default apiClient;
