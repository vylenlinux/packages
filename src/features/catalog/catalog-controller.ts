// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    ITEMS_PER_PAGE
} from '../../config.js';

import type {
    Package,
    RepositoryDefinition,
    RepositoryId,
    SearchField,
    SortBy,
    CatalogState
} from '../../types.js';

import {
    copyText
} from '../../shared/clipboard.js';

import type {
    Toast
} from '../../shared/toast.js';

import {
    buildRepositoryTabs,
    filterPackages
} from './catalog-query.js';

import {
    createCatalogState
} from './catalog-state.js';

import type {
    CatalogView
} from './catalog-view.js';

export class CatalogController {
    private readonly state: CatalogState = createCatalogState();
    private observer: IntersectionObserver | undefined;
    private searchTimer: number | undefined;
    private repositories: RepositoryDefinition[] = [];

    constructor(private readonly view: CatalogView, private readonly toast: Toast, private readonly onPackageRequested: (name: string) => void) {}

    initialize(packages: Package[], loadedRepositoryIds: RepositoryId[], repositories: RepositoryDefinition[]): void {
        this.repositories = [...repositories];
        this.state.allPackages = packages;
        this.state.loadedRepositoryIds = loadedRepositoryIds;

        this.view.totalPackages.textContent = packages.length.toLocaleString();
        this.view.setReady();
        this.view.updateSearchPlaceholder(this.state.searchField);

        this.bindEvents();
        this.renderTabs();
        this.filterAndRender();
        this.initializeInfiniteScroll();
    }

    focusSearch(): void {
        this.view.search.focus();
    }

    clearSearch(shouldFocus: boolean): void {
        window.clearTimeout(this.searchTimer);
        if (!this.view.search.value && !this.state.searchQuery) return;

        this.view.search.value = '';
        this.state.searchQuery = '';
        this.view.clearSearchButton.hidden = true;

        this.filterAndRender();
        if (shouldFocus) this.focusSearch();
    }

    private bindEvents(): void {
        this.view.search.addEventListener('input', (): void => this.queueSearch());
        this.view.search.addEventListener('search', (): void => this.applySearch());

        this.view.searchField.addEventListener('change', (): void => {
            this.state.searchField = this.view.searchField.value as SearchField;
            this.view.updateSearchPlaceholder(this.state.searchField);

            this.applySearch();
        });

        this.view.clearSearchButton.addEventListener('click', (): void => this.clearSearch(true));

        this.view.sort.addEventListener('change', (): void => {
            this.state.sortBy = this.view.sort.value as SortBy;
            this.filterAndRender();
        });

        this.view.tabs.addEventListener('click', (event: PointerEvent): void => {
            const tab: HTMLElement | null = (event.target as Element).closest<HTMLElement>('.repo-tab');
            if (!tab?.dataset.repo) return;

            this.state.activeRepo = (tab.dataset.repo as RepositoryId | 'all');

            this.renderTabs();
            this.filterAndRender();
        });

        this.view.container.addEventListener('click', (event: PointerEvent): void => this.handleCardClick(event));
        this.view.container.addEventListener('keydown', (event: KeyboardEvent): void => this.handleCardKeyboard(event));

        this.view.sentinel.querySelector('button')?.addEventListener('click', (): void => this.loadMore());
    }

    private queueSearch(): void {
        window.clearTimeout(this.searchTimer);
        const hasInput: boolean = Boolean(this.view.search.value.trim());

        this.view.clearSearchButton.hidden = !hasInput;
        this.view.updateSearchStatus(hasInput ? `Searching ${this.getSearchFieldLabel().toLocaleLowerCase()}…` : 'Showing all packages');

        this.searchTimer = window.setTimeout((): void => this.applySearch(), 120);
    }

    private applySearch(): void {
        this.state.searchQuery = this.view.search.value.trim();
        this.view.clearSearchButton.hidden = !this.state.searchQuery;

        this.filterAndRender();
    }

    private filterAndRender(): void {
        this.state.filteredPackages = filterPackages(this.state);
        this.state.displayedCount = 0;

        this.view.resetResults();
        this.updateSearchStatus();

        if (!this.state.filteredPackages.length) {
            this.view.showNoResults(this.state.searchQuery);
            this.view.emptyState.classList.remove('hidden');
            this.view.sentinel.classList.add('hidden');

            return;
        }

        this.view.emptyState.classList.add('hidden');
        this.view.sentinel.classList.remove('hidden');

        this.loadMore();
    }

    private loadMore(): void {
        if (this.state.isLoading) return;
        this.state.isLoading = true;

        const start: number = this.state.displayedCount;
        const end:   number = Math.min((start + ITEMS_PER_PAGE), this.state.filteredPackages.length);

        this.view.appendPackageCards(this.state.filteredPackages.slice(start, end));
        this.state.displayedCount = end;

        if (end >= this.state.filteredPackages.length) this.view.sentinel.classList.add('hidden');
        this.state.isLoading = false;
    }

    private renderTabs(): void {
        this.view.renderTabs(buildRepositoryTabs(this.state.allPackages, this.repositories, this.state.loadedRepositoryIds), this.state.allPackages.length, this.state.activeRepo);
    }

    private updateSearchStatus(): void {
        const count:      string = this.state.filteredPackages.length.toLocaleString();
        const selectedRepository: RepositoryDefinition | undefined = this.repositories.find((repository: RepositoryDefinition): boolean => repository.id === this.state.activeRepo);
        const repository: string = ((this.state.activeRepo === 'all') ? 'all repositories' : `${selectedRepository?.id || 'selected repository'}`);

        if (this.state.searchQuery && (this.state.filteredPackages.length === 0)) {
            this.view.updateSearchStatus(`Package not found: “${this.state.searchQuery}” in ${this.getSearchFieldLabel().toLocaleLowerCase()} · ${repository}`);
            return;
        }

        if (this.state.searchQuery) {
            this.view.updateSearchStatus(`${count} result${((this.state.filteredPackages.length === 1) ? '' : 's')} for “${this.view.search.value.trim()}” in ${this.getSearchFieldLabel().toLocaleLowerCase()} · ${repository}`);
            return;
        }

        this.view.updateSearchStatus(`${count} packages in ${repository}`);
    }

    private getSearchFieldLabel(): string {
        return (this.view.searchField.selectedOptions.item(0)?.text || 'All fields');
    }

    private handleCardKeyboard(event: KeyboardEvent): void {
        if ((event.key !== 'Enter') && (event.key !== ' ')) return;

        const card: HTMLElement | null = (event.target as Element).closest<HTMLElement>('[data-package-name]');
        if (!card?.dataset.packageName) return;

        event.preventDefault();
        this.onPackageRequested(card.dataset.packageName);
    }

    private handleCardClick(event: MouseEvent): void {
        const target: Element = event.target as Element;
        const copyTarget: HTMLElement | null = target.closest<HTMLElement>('[data-copy-command]');

        if (copyTarget) {
            event.stopPropagation();
            void this.copyWithFeedback(copyTarget);

            return;
        }

        if (target.closest('[data-stop-card]')) return;

        const card: HTMLElement | null = target.closest<HTMLElement>('[data-package-name]');
        if (card?.dataset.packageName) this.onPackageRequested(card.dataset.packageName);
    }

    private async copyWithFeedback(target: HTMLElement): Promise<void> {
        const command: string | undefined = target.dataset.copyCommand;
        if (!command) return;

        const copied: boolean = await copyText(command);
        this.toast.show(copied ? `Copied: ${command}` : 'Failed to copy');

        if (!copied || !target.classList.contains('install-cmd')) return;
        const original: string = target.innerHTML;
        target.classList.add('copied');

        target.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
            </svg>

            Copied!
        `;

        window.setTimeout((): void => {
            target.classList.remove('copied');
            target.innerHTML = original;
        }, 2000);
    }

    private initializeInfiniteScroll(): void {
        this.observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
            if (entries[0]?.isIntersecting && !this.state.isLoading) this.loadMore();
        }, {
            rootMargin: '100px'
        });

        this.observer.observe(this.view.sentinel);
    }
}
