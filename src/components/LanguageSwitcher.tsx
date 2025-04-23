import { useRouter } from 'next/router';
import { useCallback } from 'react';

const languages = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  
  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  }, [router]);
  
  return (
    <div className="flex items-center space-x-2">
      <select 
        onChange={handleLanguageChange} 
        value={router.locale}
        className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}