import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type Recommendation, type MemoryPattern } from '../lib/apiClient';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [memoryPatterns, setMemoryPatterns] = useState<MemoryPattern[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextRefreshAvailable, setNextRefreshAvailable] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getRecommendations();
      setRecommendations(data.recommendations || []);
      setMemoryPatterns(data.memoryPatterns || []);
      setGeneratedAt(data.generatedAt);
      setNextRefreshAvailable(data.nextRefreshAvailable);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchRecommendations();
  }, [user, fetchRecommendations]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const data = await api.refreshRecommendations();
      setRecommendations(data.recommendations || []);
      setMemoryPatterns(data.memoryPatterns || []);
      setGeneratedAt(new Date().toISOString());
      setNextRefreshAvailable(new Date(Date.now() + 6 * 3600000).toISOString());
    } catch (err: any) {
      console.error('Refresh failed:', err.message);
      alert(err.message || 'Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  const canRefresh = !nextRefreshAvailable || new Date() > new Date(nextRefreshAvailable);

  return { recommendations, memoryPatterns, loading, refreshing, refresh, generatedAt, canRefresh };
};
