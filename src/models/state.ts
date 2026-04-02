// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    Package
} from './package.js';

export type SortBy = 'name' | 'version' | 'maintainer';
export type Theme = 'dark' | 'light';

export interface AppState {
    allPackages: Package[];
    filteredPackages: Package[];
    activeRepo: string;
    searchQuery: string;
    sortBy: SortBy;
    displayedCount: number;
    isLoading: boolean;
}

export const initialState: AppState = {
    allPackages: [],
    filteredPackages: [],
    activeRepo: 'all',
    searchQuery: '',
    sortBy: 'name',
    displayedCount: 0,
    isLoading: false
};
