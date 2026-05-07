/**
 * AI Search Component - Vanilla JS
 * Semantic search with AI-powered results and citations
 */

import { getStore } from '../core/store';
import { HttpClient } from '../api/http';
import {
  defaultTheme,
  mergeThemes,
  createThemeFromConfig
} from '../theming/theme';
import {
  generateCSSVariables,
  injectBaseStyles,
  BASE_STYLES
} from '../theming/css-variables';
import type {
  SwfteChatConfig,
  ChatTheme,
  AISearchOptions,
  SearchResponse,
  SearchResult,
  SearchCitation
} from '../types';

// Re-export types for external use
export type { SearchResult, SearchCitation, SearchResponse } from '../types';

export class AISearch {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private config: SwfteChatConfig;
  private options: AISearchOptions;
  private httpClient: HttpClient;
  private theme: ChatTheme;
  private isLoading = false;
  private results: SearchResult[] = [];
  private query = '';
  private suggestions: string[] = [];

  constructor(config: SwfteChatConfig, options: AISearchOptions = {}) {
    this.config = config;
    this.options = {
      placeholder: 'Search for answers...',
      showSuggestions: true,
      maxResults: 10,
      showCitations: true,
      ...options,
    };

    this.httpClient = new HttpClient({
      baseUrl: config.baseUrl,
      defaultHeaders: {
        'X-Widget-ID': config.widgetId,
      },
    });

    // Build theme
    const widgetConfig = getStore().getState().config;
    const baseTheme = widgetConfig
      ? createThemeFromConfig(widgetConfig)
      : defaultTheme;
    this.theme = options.theme
      ? mergeThemes(baseTheme, options.theme)
      : baseTheme;
  }

  /**
   * Mount the search component to the DOM
   */
  mount(container: HTMLElement | string): void {
    const target = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!target) {
      throw new Error('AISearch: Container not found');
    }

    this.container = target as HTMLElement;
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    injectBaseStyles();

    // Render
    this.render();
  }

  /**
   * Unmount the component
   */
  unmount(): void {
    if (this.container && this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
    }
    this.container = null;
    this.shadowRoot = null;
  }

  /**
   * Perform a search
   */
  async search(query: string): Promise<SearchResponse> {
    this.query = query;
    this.isLoading = true;
    this.render();

    try {
      const apiResponse = await this.httpClient.post<SearchResponse>(
        `/v1/widgets/${this.config.widgetId}/search`,
        {
          query,
          limit: this.options.maxResults,
          filters: this.options.filters,
        }
      );

      const response = apiResponse.data;
      this.results = response.results;
      this.suggestions = response.suggestions || [];
      this.isLoading = false;
      this.render();

      // Emit event
      this.options.onSearch?.(query, response);

      return response;
    } catch (error) {
      this.isLoading = false;
      this.results = [];
      this.render();
      throw error;
    }
  }

  /**
   * Clear search results
   */
  clear(): void {
    this.query = '';
    this.results = [];
    this.suggestions = [];
    this.render();
  }

  /**
   * Render the component
   */
  private render(): void {
    if (!this.shadowRoot) return;

    const cssVars = generateCSSVariables(this.theme);

    this.shadowRoot.innerHTML = `
      <style>
        ${BASE_STYLES}

        :host {
          display: block;
          font-family: var(--swfte-font-family);
        }

        .swfte-search {
          ${cssVars}
          background: var(--swfte-color-background);
          border-radius: var(--swfte-radius-lg);
          box-shadow: var(--swfte-shadow-sm);
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
          color: var(--swfte-color-text-muted);
        }

        .swfte-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
          color: var(--swfte-color-text);
        }

        .swfte-search-input::placeholder {
          color: var(--swfte-color-text-muted);
        }

        .swfte-search-clear {
          flex-shrink: 0;
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--swfte-color-text-muted);
          border-radius: 4px;
          display: ${this.query ? 'flex' : 'none'};
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
          border: 2px solid var(--swfte-color-primary);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
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
          color: var(--swfte-color-text);
          margin-bottom: 4px;
        }

        .swfte-search-result-content {
          font-size: 14px;
          color: var(--swfte-color-text-muted);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .swfte-search-result-source {
          font-size: 12px;
          color: var(--swfte-color-primary);
          margin-top: 8px;
        }

        .swfte-search-citations {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed rgba(0, 0, 0, 0.1);
        }

        .swfte-search-citation {
          font-size: 12px;
          color: var(--swfte-color-text-muted);
          margin-bottom: 4px;
        }

        .swfte-search-citation-link {
          color: var(--swfte-color-primary);
          text-decoration: none;
        }

        .swfte-search-citation-link:hover {
          text-decoration: underline;
        }

        .swfte-search-empty {
          padding: 32px;
          text-align: center;
          color: var(--swfte-color-text-muted);
        }

        .swfte-search-suggestions {
          padding: 12px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .swfte-search-suggestions-label {
          font-size: 12px;
          color: var(--swfte-color-text-muted);
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
          color: var(--swfte-color-text-muted);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .swfte-search-powered-by a {
          color: var(--swfte-color-primary);
          text-decoration: none;
        }
      </style>

      <div class="swfte-search">
        <div class="swfte-search-input-container">
          <svg class="swfte-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            class="swfte-search-input"
            placeholder="${this.options.placeholder}"
            value="${this.escapeHtml(this.query)}"
          />
          <button class="swfte-search-clear" aria-label="Clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </button>
        </div>

        <div class="swfte-search-results">
          ${this.renderResults()}
        </div>

        ${this.renderSuggestions()}

        ${this.options.showPoweredBy !== false ? `
          <div class="swfte-search-powered-by">
            Powered by <a href="https://swfte.com" target="_blank" rel="noopener noreferrer">Swfte</a>
          </div>
        ` : ''}
      </div>
    `;

    // Bind events
    this.bindEvents();
  }

  private renderResults(): string {
    if (this.isLoading) {
      return `
        <div class="swfte-search-loading">
          <div class="swfte-search-spinner"></div>
        </div>
      `;
    }

    if (this.query && this.results.length === 0) {
      return `
        <div class="swfte-search-empty">
          No results found for "${this.escapeHtml(this.query)}"
        </div>
      `;
    }

    if (this.results.length === 0) {
      return '';
    }

    return this.results.map(result => `
      <div class="swfte-search-result" data-id="${result.id}">
        <div class="swfte-search-result-title">${this.escapeHtml(result.title)}</div>
        <div class="swfte-search-result-content">${this.escapeHtml(result.content)}</div>
        ${result.source ? `<div class="swfte-search-result-source">${this.escapeHtml(result.source)}</div>` : ''}
        ${this.options.showCitations && result.citations?.length ? this.renderCitations(result.citations) : ''}
      </div>
    `).join('');
  }

  private renderCitations(citations: SearchCitation[]): string {
    return `
      <div class="swfte-search-citations">
        ${citations.map(citation => `
          <div class="swfte-search-citation">
            ${citation.url
              ? `<a class="swfte-search-citation-link" href="${this.escapeHtml(citation.url)}" target="_blank">${this.escapeHtml(citation.source)}</a>`
              : this.escapeHtml(citation.source)
            }
            ${citation.page ? ` - Page ${citation.page}` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderSuggestions(): string {
    if (!this.options.showSuggestions || this.suggestions.length === 0) {
      return '';
    }

    return `
      <div class="swfte-search-suggestions">
        <div class="swfte-search-suggestions-label">Suggested searches</div>
        ${this.suggestions.map(suggestion => `
          <span class="swfte-search-suggestion">${this.escapeHtml(suggestion)}</span>
        `).join('')}
      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.shadowRoot) return;

    // Search input
    const input = this.shadowRoot.querySelector('.swfte-search-input') as HTMLInputElement;
    if (input) {
      let debounceTimer: ReturnType<typeof setTimeout>;
      input.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (value.trim()) {
            this.search(value);
          } else {
            this.clear();
          }
        }, 300);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = input.value.trim();
          if (value) {
            clearTimeout(debounceTimer);
            this.search(value);
          }
        }
      });
    }

    // Clear button
    const clearBtn = this.shadowRoot.querySelector('.swfte-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clear();
        input?.focus();
      });
    }

    // Result clicks
    const results = this.shadowRoot.querySelectorAll('.swfte-search-result');
    results.forEach((result) => {
      result.addEventListener('click', () => {
        const id = result.getAttribute('data-id');
        const searchResult = this.results.find(r => r.id === id);
        if (searchResult) {
          this.options.onResultClick?.(searchResult);
        }
      });
    });

    // Suggestion clicks
    const suggestions = this.shadowRoot.querySelectorAll('.swfte-search-suggestion');
    suggestions.forEach((suggestion) => {
      suggestion.addEventListener('click', () => {
        const text = suggestion.textContent || '';
        if (input) {
          input.value = text;
        }
        this.search(text);
      });
    });
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
