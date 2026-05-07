/**
 * AI Search - React Component
 * Semantic search with AI-powered results and citations
 */

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatClient, useChatStore } from './ChatProvider';
import type { ChatTheme } from '../src/types';
import { defaultTheme, mergeThemes, createThemeFromConfig } from '../src/theming/theme';
import { generateCSSVariables, injectBaseStyles } from '../src/theming/css-variables';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  source?: string;
  url?: string;
  citations?: Citation[];
  metadata?: Record<string, unknown>;
}

export interface Citation {
  text: string;
  source: string;
  url?: string;
  page?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  suggestions?: string[];
  totalCount: number;
  hasMore: boolean;
}

export interface AISearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Maximum number of results */
  maxResults?: number;
  /** Show citations in results */
  showCitations?: boolean;
  /** Custom theme overrides */
  theme?: Partial<ChatTheme>;
  /** Search filters */
  filters?: Record<string, unknown>;
  /** Show powered by badge */
  showPoweredBy?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Callback when search is performed */
  onSearch?: (query: string, response: SearchResponse) => void;
  /** Callback when a result is clicked */
  onResultClick?: (result: SearchResult) => void;
}

export function AISearch({
  placeholder = 'Search for answers...',
  showSuggestions = true,
  maxResults = 10,
  showCitations = true,
  theme: themeOverrides,
  filters,
  showPoweredBy = true,
  className = '',
  style = {},
  onSearch,
  onResultClick,
}: AISearchProps) {
  const client = useChatClient();
  const { state } = useChatStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build theme
  const config = state?.config;
  const baseTheme = config ? createThemeFromConfig(config) : defaultTheme;
  const theme = themeOverrides ? mergeThemes(baseTheme, themeOverrides) : baseTheme;
  const cssVars = generateCSSVariables(theme);

  // Inject base styles
  useEffect(() => {
    injectBaseStyles();
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await client.search(searchQuery, { limit: maxResults, filters });
      setResults(response.results);
      setSuggestions(response.suggestions || []);
      onSearch?.(searchQuery, response);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [client, maxResults, filters, onSearch]);

  // Debounced search on input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  // Handle enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      performSearch(query);
    }
  }, [performSearch, query]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setHasSearched(false);
    inputRef.current?.focus();
  }, []);

  // Click suggestion
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  }, [performSearch]);

  // Click result
  const handleResultClick = useCallback((result: SearchResult) => {
    onResultClick?.(result);
  }, [onResultClick]);

  return (
    <div
      className={`swfte-search ${className}`}
      style={{ ...parseStyles(cssVars), ...style }}
    >
      {/* Search Input */}
      <div className="swfte-search-input-container">
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          className="swfte-search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            className="swfte-search-clear"
            onClick={handleClear}
            aria-label="Clear"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="swfte-search-results">
        {isLoading ? (
          <div className="swfte-search-loading">
            <div className="swfte-search-spinner" />
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="swfte-search-empty">
            No results found for "{query}"
          </div>
        ) : (
          results.map((result) => (
            <div
              key={result.id}
              className="swfte-search-result"
              onClick={() => handleResultClick(result)}
            >
              <div className="swfte-search-result-title">{result.title}</div>
              <div className="swfte-search-result-content">{result.content}</div>
              {result.source && (
                <div className="swfte-search-result-source">{result.source}</div>
              )}
              {showCitations && result.citations && result.citations.length > 0 && (
                <div className="swfte-search-citations">
                  {result.citations.map((citation, idx) => (
                    <div key={idx} className="swfte-search-citation">
                      {citation.url ? (
                        <a
                          className="swfte-search-citation-link"
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {citation.source}
                        </a>
                      ) : (
                        citation.source
                      )}
                      {citation.page && ` - Page ${citation.page}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="swfte-search-suggestions">
          <div className="swfte-search-suggestions-label">Suggested searches</div>
          {suggestions.map((suggestion, idx) => (
            <span
              key={idx}
              className="swfte-search-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </span>
          ))}
        </div>
      )}

      {/* Powered By */}
      {showPoweredBy && (
        <div className="swfte-search-powered-by">
          Powered by{' '}
          <a href="https://swfte.com" target="_blank" rel="noopener noreferrer">
            Swfte
          </a>
        </div>
      )}

      {/* Inline Styles */}
      <style>{searchStyles}</style>
    </div>
  );
}

// Helper to parse CSS variables string to style object
function parseStyles(cssVars: string): React.CSSProperties {
  const styles: Record<string, string> = {};
  cssVars.split(';').forEach((rule) => {
    const [key, value] = rule.split(':').map((s) => s.trim());
    if (key && value) {
      styles[key] = value;
    }
  });
  return styles as React.CSSProperties;
}

// Icons
function SearchIcon() {
  return (
    <svg
      className="swfte-search-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

// Component styles
const searchStyles = `
  .swfte-search {
    font-family: var(--swfte-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    background: var(--swfte-color-background, #ffffff);
    border-radius: var(--swfte-radius-lg, 16px);
    box-shadow: var(--swfte-shadow-sm, 0 2px 8px rgba(0,0,0,0.1));
    overflow: hidden;
  }

  .swfte-search-input-container {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    gap: 12px;
  }

  .swfte-search-icon {
    flex-shrink: 0;
    color: var(--swfte-color-text-muted, #6b7280);
  }

  .swfte-search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    background: transparent;
    color: var(--swfte-color-text, #1f2937);
  }

  .swfte-search-input::placeholder {
    color: var(--swfte-color-text-muted, #6b7280);
  }

  .swfte-search-clear {
    flex-shrink: 0;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--swfte-color-text-muted, #6b7280);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .swfte-search-clear:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .swfte-search-results {
    max-height: 400px;
    overflow-y: auto;
  }

  .swfte-search-loading {
    display: flex;
    justify-content: center;
    padding: 24px;
  }

  .swfte-search-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--swfte-color-primary, #3b82f6);
    border-top-color: transparent;
    border-radius: 50%;
    animation: swfte-spin 1s linear infinite;
  }

  @keyframes swfte-spin {
    to { transform: rotate(360deg); }
  }

  .swfte-search-result {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: background 0.15s;
  }

  .swfte-search-result:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .swfte-search-result:last-child {
    border-bottom: none;
  }

  .swfte-search-result-title {
    font-weight: 600;
    font-size: 15px;
    color: var(--swfte-color-text, #1f2937);
    margin-bottom: 4px;
  }

  .swfte-search-result-content {
    font-size: 14px;
    color: var(--swfte-color-text-muted, #6b7280);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .swfte-search-result-source {
    font-size: 12px;
    color: var(--swfte-color-primary, #3b82f6);
    margin-top: 8px;
  }

  .swfte-search-citations {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed rgba(0, 0, 0, 0.1);
  }

  .swfte-search-citation {
    font-size: 12px;
    color: var(--swfte-color-text-muted, #6b7280);
    margin-bottom: 4px;
  }

  .swfte-search-citation-link {
    color: var(--swfte-color-primary, #3b82f6);
    text-decoration: none;
  }

  .swfte-search-citation-link:hover {
    text-decoration: underline;
  }

  .swfte-search-empty {
    padding: 32px;
    text-align: center;
    color: var(--swfte-color-text-muted, #6b7280);
  }

  .swfte-search-suggestions {
    padding: 12px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .swfte-search-suggestions-label {
    font-size: 12px;
    color: var(--swfte-color-text-muted, #6b7280);
    margin-bottom: 8px;
  }

  .swfte-search-suggestion {
    display: inline-block;
    padding: 4px 12px;
    margin-right: 8px;
    margin-bottom: 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .swfte-search-suggestion:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .swfte-search-powered-by {
    padding: 8px;
    text-align: center;
    font-size: 11px;
    color: var(--swfte-color-text-muted, #6b7280);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .swfte-search-powered-by a {
    color: var(--swfte-color-primary, #3b82f6);
    text-decoration: none;
  }
`;
