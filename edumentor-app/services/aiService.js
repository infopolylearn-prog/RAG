import { getAuthSession } from './authStorage';

/**
 * Secure EduMentor AI Frontend Service
 * Communicates strictly with the backend node.js Express API.
 * Never leaks AI provider API keys in frontend.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://edumentor-backend-fbe9.onrender.com';

export async function askAI(message, subject = 'General', context = '') {
  const endpoint = `${API_URL}/api/ai/chat`;
  const session = await getAuthSession();

  if (!session?.token) {
    throw new Error('Authentication token is missing. Please sign in again.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`
    },
    body: JSON.stringify({ message, subject, context })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return {
    answer: data.answer,
    model: data.model || 'unknown',
    success: data.success ?? true
  };
}

