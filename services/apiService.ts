
import { API_CONFIG } from '../constants';

/**
 * Fetch a record from a specific bin (GET)
 */
export const fetchRecord = async <T>(binId: string): Promise<T | null> => {
  if (!binId) return null;
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_CONFIG.MASTER_KEY
      }
    });

    if (!response.ok) throw new Error(`Failed to fetch bin ${binId}`);
    const json = await response.json();
    return json.record as T;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return null;
  }
};

/**
 * Update a specific bin (PUT)
 */
export const updateRecord = async <T>(binId: string, data: T): Promise<boolean> => {
  if (!binId) return false;
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_CONFIG.MASTER_KEY
      },
      body: JSON.stringify(data)
    });

    return response.ok;
  } catch (error) {
    console.error('API Update Error:', error);
    return false;
  }
};

// Added missing deleteBin function to resolve compilation error in Settings.tsx
/**
 * Delete a specific bin (DELETE)
 */
export const deleteBin = async (binId: string): Promise<boolean> => {
  if (!binId) return false;
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${binId}`, {
      method: 'DELETE',
      headers: {
        'X-Master-Key': API_CONFIG.MASTER_KEY
      }
    });

    return response.ok;
  } catch (error) {
    console.error('API Delete Error:', error);
    return false;
  }
};

/**
 * Create a new bin (POST) - Helper if needed
 */
export const createBin = async <T>(data: T): Promise<string | null> => {
  try {
    const response = await fetch(API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_CONFIG.MASTER_KEY
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to create bin');
    const json = await response.json();
    return json.metadata.id;
  } catch (error) {
    console.error('API Create Error:', error);
    return null;
  }
};
