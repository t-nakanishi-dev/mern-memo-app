// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/api";
import { fetchProfile as fetchProfileApi } from "../api";

export const useProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProfileApi();

      setProfile(data);
    } catch (err: unknown) {
      console.error("プロフィール取得エラー:", err);

      const message =
        err instanceof Error
          ? err.message
          : "プロフィール取得に失敗しました。ログインし直してください。";

      setError(message);

      setTimeout(() => navigate("/login"), 2000);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
  };
};
