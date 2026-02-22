// src/store/themeStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light", // デフォルト値（persistが上書きする）

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "theme-storage", // localStorageのキー名
      storage: createJSONStorage(() => localStorage),

      // partialize はシンプルなので残してもOK（なくても動作する）
      partialize: (state) => ({ theme: state.theme }),

      // 再ハイドレーション（復元）時のカスタム処理
      onRehydrateStorage: () => (state, error) => {
        // エラーがあればログ（任意）
        if (error) {
          console.error("Theme store hydration failed:", error);
          return;
        }

        if (!state) return;

        // 保存された値がまだない（初回訪問）場合のみ system preference を適用
        const hasSaved = !!localStorage.getItem("theme-storage");
        if (!hasSaved) {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;
          state.theme = prefersDark ? "dark" : "light";
        }

        // クラスを確実に適用（toggleで安全に）
        document.documentElement.classList.toggle(
          "dark",
          state.theme === "dark",
        );
      },
    },
  ),
);
