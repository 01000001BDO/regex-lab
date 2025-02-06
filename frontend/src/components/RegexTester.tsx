'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../lib/api-client';
import { convertRegexToLanguages, RegexConversion } from '../lib/regex-converter';
import copyToClipboard from 'clipboard-copy';

export default function RegexTester({ initialRegex }: { initialRegex?: { pattern: string, testString: string } }) {
  const [pattern, setPattern] = useState(initialRegex?.pattern || '');
  const [testString, setTestString] = useState(initialRegex?.testString || '');
  const [matches, setMatches] = useState<string[]>([]);
  const [isValidRegex, setIsValidRegex] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [savedRegexes, setSavedRegexes] = useState<Array<{pattern: string, testString: string}>>([]);
  const [activeTab, setActiveTab] = useState<'test' | 'saved'>('test');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [matchCount, setMatchCount] = useState(0);
  const [parsingSpeed, setParsingSpeed] = useState(0);
  const [convertedRegex, setConvertedRegex] = useState<RegexConversion | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<keyof RegexConversion>('javascript');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedRegexes') || '[]');
    setSavedRegexes(saved);
  }, []);

  const validateRegex = useCallback(async (regexPattern?: string) => {
    const patternToValidate = regexPattern || pattern;
    try {
      const isValid = await apiClient.validateRegex(patternToValidate);
      setIsValidRegex(isValid);
      return isValid;
    } catch (error) {
      console.error('Validation error', error);
      setIsValidRegex(false);
      return false;
    }
  }, [pattern]);

  const testRegex = async () => {
    if (!(await validateRegex())) return;

    const startTime = performance.now();
    try {
      const result = await apiClient.testRegex({ pattern, testString });
      const endTime = performance.now();
      
      const matches = result.matches || [];
      setMatchCount(matches.length);
      setParsingSpeed(Number((endTime - startTime).toFixed(2)));
      
      const conversions = convertRegexToLanguages(pattern);
      setConvertedRegex(conversions);
      
      setMatches(matches);
    } catch (error) {
      console.error('Test error', error);
      setMatches([]);
      setMatchCount(0);
      setParsingSpeed(0);
      setConvertedRegex(null);
    }
  };

  const shareRegex = async () => {
    if (!(await validateRegex())) return;

    try {
      const result = await apiClient.shareRegex({ pattern, testString });
      const link = `${window.location.origin}/#${result.shareId}`;
      setShareLink(link);
      copyToClipboard(link);
    } catch (error) {
      console.error('Share error', error);
    }
  };

  const saveRegex = () => {
    if (!isValidRegex) return;
    const newRegex = { pattern, testString };
    const updatedRegexes = [...savedRegexes, newRegex];
    setSavedRegexes(updatedRegexes);
    localStorage.setItem('savedRegexes', JSON.stringify(updatedRegexes));
  };

  const exportRegexesToJSON = () => {
    const jsonContent = JSON.stringify(savedRegexes, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'saved_regexes.json';
    link.click();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`${isMobile ? 'p-2' : 'container mx-auto max-w-4xl px-4 py-8'}`}>
        <div className="flex justify-end mb-4">
          <button 
            onClick={toggleTheme}
            className="flex items-center space-x-2 px-4 py-2 rounded-md"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div className={`rounded-lg overflow-hidden shadow-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
        }`}>
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('test')}
              className={`flex-1 py-3 text-center font-semibold transition-colors 
                ${activeTab === 'test' 
                  ? (theme === 'dark' 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-500 text-white')
                  : (theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100')}`}
            >
              🔍 Regex Tester
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 text-center font-semibold transition-colors 
                ${activeTab === 'saved' 
                  ? (theme === 'dark' 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-500 text-white')
                  : (theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100')}`}
            >
              📦 Saved Regexes
            </button>
          </div>
          {activeTab === 'test' && (
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={pattern}
                onChange={(e) => {
                  setPattern(e.target.value);
                  validateRegex(e.target.value);
                }}
                placeholder="Enter regex pattern"
                className={`w-full px-3 py-2 border rounded-md transition-colors 
                  ${theme === 'dark' 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'border-gray-300'}
                  ${isValidRegex 
                    ? '' 
                    : 'border-red-500 text-red-600'}`}
              />
              
              <div className="flex justify-between text-sm mb-2">
                <span>Matches: {matchCount}</span>
                <span>Parsing Speed: {parsingSpeed}ms</span>
              </div>

              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter test string"
                rows={4}
                className={`w-full px-3 py-2 border rounded-md transition-colors 
                  ${theme === 'dark' 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'border-gray-300'}`}
              />
              
              <div className="flex space-x-2">
                <button 
                  onClick={testRegex}
                  disabled={!isValidRegex}
                  className={`flex-1 py-2 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'}
                    disabled:opacity-50`}
                >
                  🧪 Test Regex
                </button>
                <button 
                  onClick={saveRegex}
                  disabled={!isValidRegex}
                  className={`flex-1 py-2 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-500 text-white hover:bg-green-600'}
                    disabled:opacity-50`}
                >
                  💾 Save Regex
                </button>
                <button 
                  onClick={shareRegex}
                  disabled={!isValidRegex}
                  className={`flex-1 py-2 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-purple-500 text-white hover:bg-purple-600'}
                    disabled:opacity-50`}
                >
                  🔗 Share Regex
                </button>
              </div>

              {shareLink && (
                <div className={`p-3 rounded-md mt-2 ${
                  theme === 'dark' 
                    ? 'bg-green-900 text-green-200' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  <p>Share Link Copied: 📋</p>
                  <input 
                    type="text" 
                    value={shareLink} 
                    readOnly 
                    className={`w-full rounded p-1 ${
                      theme === 'dark' 
                        ? 'bg-green-800 text-green-200' 
                        : 'bg-green-200 text-green-800'
                    }`}
                  />
                </div>
              )}
            </div>
          )}
          <div className={`p-6 ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-200' 
              : 'bg-gray-50'
          }`}>
            <h2 className="text-lg font-semibold mb-3">🎯 Matches</h2>
            {matches.length > 0 ? (
              <div>
                <p>Found {matches.length} match(es):</p>
                <ul className={`space-y-1 p-3 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-gray-800' 
                    : 'bg-white border'
                }`}>
                  {matches.map((match, index) => (
                    <li 
                      key={index} 
                      className={`px-2 py-1 rounded ${
                        theme === 'dark' 
                          ? 'bg-blue-900 text-blue-200' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {match}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">No matches found 🕵️‍♀️</p>
            )}
          </div>
          {convertedRegex && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Regex in Different Languages</h3>
              
              <div className="flex space-x-2 mb-3">
                {Object.keys(convertedRegex).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang as keyof RegexConversion)}
                    className={`px-3 py-1 rounded ${
                      activeLanguage === lang 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                {typeof convertedRegex[activeLanguage] === 'object' ? (
                  Object.entries(convertedRegex[activeLanguage] as Record<string, string>).map(([variant, code]) => (
                    <div key={variant} className="mb-2">
                      <span className="font-bold capitalize">{variant}:</span>
                      <code 
                        className="ml-2 bg-gray-200 px-2 py-1 rounded cursor-pointer"
                        onClick={() => copyToClipboard(code)}
                      >
                        {code}
                      </code>
                    </div>
                  ))
                ) : (
                  <code 
                    className="bg-gray-200 px-2 py-1 rounded cursor-pointer"
                    onClick={() => copyToClipboard(convertedRegex[activeLanguage] as unknown as string)}
                  >
                    {convertedRegex[activeLanguage]}
                  </code>
                )}
              </div>
            </div>
          )}
          {activeTab === 'saved' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">📚 Saved Regexes</h2>
                <button 
                  onClick={exportRegexesToJSON}
                  className={`px-3 py-1 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-500 text-white hover:bg-green-600'}`}
                >
                  📤 Export JSON
                </button>
              </div>

              {savedRegexes.length === 0 ? (
                <p className="text-center">No saved regexes 📭</p>
              ) : (
                <ul className="space-y-3">
                  {savedRegexes.map((regex, index) => (
                    <li 
                      key={index}
                      className={`p-4 rounded-md flex justify-between items-center ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">🔤 {regex.pattern}</p>
                        <p className="text-sm opacity-70">📝 {regex.testString}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setPattern(regex.pattern);
                            setTestString(regex.testString);
                            setActiveTab('test');
                            validateRegex(regex.pattern);
                          }}
                          className={`px-3 py-1 rounded-md transition-colors
                            ${theme === 'dark' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                          ↩️ Load
                        </button>
                        <button 
                          onClick={() => {
                            const updatedRegexes = savedRegexes.filter((_, i) => i !== index);
                            setSavedRegexes(updatedRegexes);
                            localStorage.setItem('savedRegexes', JSON.stringify(updatedRegexes));
                          }}
                          className={`px-3 py-1 rounded-md transition-colors
                            ${theme === 'dark' 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-red-500 text-white hover:bg-red-600'}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

