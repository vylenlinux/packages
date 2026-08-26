// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    CatalogState,
    Package,
    RepositoryDefinition,
    RepositoryId,
    RepositoryTab
} from '../../types.js';

import {
    normalizeSearchText,
    normalizeVersion
} from './normalization.js';

export function filterPackages(state: CatalogState): Package[] {
    const terms: string[] = normalizeSearchText(state.searchQuery).split(' ').filter(Boolean);
    const versionQuery: string = normalizeVersion(state.searchQuery);

    return state.allPackages.filter((pkg: Package): boolean => {
        const matchesRepository: boolean = ((state.activeRepo === 'all') || (pkg._repo === state.activeRepo));
        const fieldValue: string = pkg._searchIndex[state.searchField];

        const matchesQuery: boolean = ((state.searchField === 'version') ? (!versionQuery || fieldValue.includes(versionQuery)) : terms.every((term: string): boolean => fieldValue.includes(term)));
        return (matchesRepository && matchesQuery);
    }).sort((left: Package, right: Package): number => {
        if (state.sortBy === 'version') return right.version.localeCompare(left.version);
        if (state.sortBy === 'maintainer') return (left.maintainer || 'Unknown').localeCompare(right.maintainer || 'Unknown');

        return left.name.localeCompare(right.name);
    });
}

export function buildRepositoryTabs(packages: Package[], repositories: RepositoryDefinition[], loadedRepositoryIds: RepositoryId[]): RepositoryTab[] {
    return repositories.filter((repository: RepositoryDefinition): boolean => loadedRepositoryIds.includes(repository.id)).map((repository: RepositoryDefinition): RepositoryTab => ({
        id: repository.id,
        name: repository.id,
        count: packages.filter((pkg: Package): boolean => (pkg._repo === repository.id)).length
    }));
}
