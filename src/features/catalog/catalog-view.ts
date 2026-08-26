// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    GITLAB_BASE
} from '../../config.js';

import type {
    CatalogLoadProgress,
    Package,
    RepositoryId,
    RepositoryTab,
    SearchField
} from '../../types.js';

import {
    element
} from '../../shared/dom.js';

import {
    templateEnvironment,
    templates
} from '../../shared/templates.js';

const SEARCH_PLACEHOLDERS: Record<SearchField, string> = {
    all: 'Search all fields',
    name: 'Search package name',
    version: 'Search version',
    maintainer: 'Search maintainer',
    description: 'Search description'
};

export class CatalogView {
    readonly loading: HTMLElement = element<HTMLElement>('#loading');
    readonly error: HTMLElement = element<HTMLElement>('#error');
    readonly packageList: HTMLElement = element<HTMLElement>('#package-list');
    readonly container: HTMLElement = element<HTMLElement>('#packages-container');
    readonly sentinel: HTMLElement = element<HTMLElement>('#sentinel');
    readonly emptyState: HTMLElement = element<HTMLElement>('#empty-state');
    readonly tabs: HTMLElement = element<HTMLElement>('#repo-tabs');
    readonly search: HTMLInputElement = element<HTMLInputElement>('#search');
    readonly searchField: HTMLSelectElement = element<HTMLSelectElement>('#search-field');
    readonly sort: HTMLSelectElement = element<HTMLSelectElement>('#sort-by');
    readonly clearSearchButton: HTMLButtonElement = element<HTMLButtonElement>('[data-clear-search]');
    readonly searchStatus: HTMLElement = element<HTMLElement>('#search-status');
    readonly totalPackages: HTMLElement = element<HTMLElement>('#total-packages');
    readonly totalRepos: HTMLElement = element<HTMLElement>('#total-repos');
    readonly loadedRepos: HTMLElement = element<HTMLElement>('#loaded-repos');

    setRepositoryProgress({
        successful,
        total
    }: CatalogLoadProgress): void {
        this.totalRepos.textContent  = String(successful);
        this.loadedRepos.textContent = `${successful}/${total}`;
    }

    showError(message: string): void {
        this.setError(message);
    }

    setReady(): void {
        this.loading.classList.add('hidden');
        this.packageList.classList.remove('hidden');

        this.search.disabled = false;
        this.searchField.disabled = false;
        this.sort.disabled = false;
    }

    setError(message: string): void {
        this.loading.classList.add('hidden');

        this.error.textContent = message;
        this.error.classList.remove('hidden');
    }

    updateSearchPlaceholder(searchField: SearchField): void {
        this.search.placeholder = SEARCH_PLACEHOLDERS[searchField];
    }

    renderTabs(tabs: RepositoryTab[], totalCount: number, activeRepo: RepositoryId | 'all'): void {
        this.tabs.innerHTML = templateEnvironment.renderString(templates.repositoryTabs, {
            tabs,
            totalCount,
            activeRepo
        });
    }

    resetResults(): void {
        this.container.replaceChildren();
    }

    appendPackageCards(packages: Package[]): void {
        const fragment: DocumentFragment = document.createDocumentFragment();

        for (const pkg of packages) {
            const markup: string = templateEnvironment.renderString(templates.packageCard, {
                package: pkg,
                gitlabBase: GITLAB_BASE
            });

            fragment.append(document.createRange().createContextualFragment(markup));
        }

        this.container.append(fragment);
    }

    updateSearchStatus(status: string): void {
        this.searchStatus.textContent = status;
    }
}
