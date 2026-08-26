// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    CatalogState
} from '../../types.js';

export function createCatalogState(): CatalogState {
    return {
        allPackages: [],
        filteredPackages: [],
        loadedRepositoryIds: [],
        activeRepo: 'all',
        searchQuery: '',
        searchField: 'all',
        sortBy: 'name',
        displayedCount: 0,
        isLoading: false
    };
}
