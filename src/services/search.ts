// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    AppState,
    SortBy
} from '../models/state.js';

import type {
    Package
} from '../models/package.js';

export class SearchService {
    filter(state: AppState): void {
        state.filteredPackages = state.allPackages.filter((pkg: Package): boolean => {
            const matchesRepo:   boolean = ((state.activeRepo === 'all') || (pkg._repo === state.activeRepo));
            const matchesSearch: boolean = (!state.searchQuery || pkg._searchable.includes(state.searchQuery));

            return matchesRepo && matchesSearch;
        });

        this.sort(state, state.sortBy);
    }

    sort(state: AppState, sortBy: SortBy): void {
        state.sortBy = sortBy;

        state.filteredPackages.sort((a: Package, b: Package): number => {
            switch(sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'version':
                    return (b.version || '').localeCompare(a.version || '');
                case 'maintainer':
                    return (a.maintainer || 'Unknown').localeCompare(b.maintainer || 'Unknown');
                default:
                    return 0;
            }
        });
    }
}
