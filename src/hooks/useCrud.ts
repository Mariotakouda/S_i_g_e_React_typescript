import { useEffect, useState } from "react";
import { api } from "../api/axios";

export function useCrud<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get(endpoint);
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const create = async (item: Partial<T>) => {
    await api.post(endpoint, item);
    await fetchData();
  };

  const update = async (id: number, item: Partial<T>) => {
    await api.put(`${endpoint}/${id}`, item);
    await fetchData();
  };

  const remove = async (id: number) => {
    await api.delete(`${endpoint}/${id}`);
    await fetchData();
  };

  return { data, loading, create, update, remove };
}
