import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Varsayılan olarak karanlık temayı başlat, ama hafızada varsa onu kullan
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tactical-os-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Tactical OS'in ruhu dark'tır!
  });

  // Tema değiştiğinde HTML etiketine 'dark' class'ını ekle/çıkar
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('tactical-os-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value = {{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};