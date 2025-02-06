import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface RegexTestRequest {
  pattern: string;
  testString: string;
}

export interface RegexTestResponse {
  matches: string[];
}

export interface RegexShareResponse {
  shareId: string;
}

export const apiClient = {
  validateRegex: async (pattern: string) => {
    const response = await axios.post(`${API_BASE_URL}/regex/validate`, { pattern });
    return response.data.isValid;
  },

  testRegex: async (data: RegexTestRequest): Promise<RegexTestResponse> => {
    const response = await axios.post(`${API_BASE_URL}/regex/test`, data);
    return response.data;
  },

  shareRegex: async (data: RegexTestRequest): Promise<RegexShareResponse> => {
    const response = await axios.post(`${API_BASE_URL}/regex/share`, data);
    return response.data;
  },

  getSharedRegex: async (shareId: string): Promise<RegexTestRequest> => {
    const response = await axios.get(`${API_BASE_URL}/regex/${shareId}`);
    return response.data;
  }
};