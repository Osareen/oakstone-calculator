export const storage = {
  async get(key) {
    try {
      const res = await fetch(`/api/${key}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch');
      }
      const data = await res.json();
      return { key, value: JSON.stringify(data) };
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      const res = await fetch(`/api/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: value,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }
      return { key, value };
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  }
};