export class ApiService {
  /**
   * Generic fetch wrapper that intercepts calls to Dev A/B APIs and returns mock data
   */
  static async fetch(endpoint, options = {}) {
    // Attempt real fetch to backend
    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, options);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn(`[ApiService] Failed to reach real backend for ${endpoint}, falling back to mock.`);
    }

    // Fallback Mock Implementations
    return this.mockResponse(endpoint, options);
  }

  static async mockResponse(endpoint, options) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (endpoint.startsWith('/api/jobs')) {
      return { status: 'success', data: [] };
    }
    
    if (endpoint.startsWith('/api/auth')) {
      return { status: 'success', user: { id: 'u1', name: 'Arjun Sharma' } };
    }

    return { status: 'mock', message: 'API not implemented yet' };
  }
}
