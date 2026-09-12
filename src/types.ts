// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export type RepositoryId = string;
export type SortBy = 'name' | 'version' | 'maintainer';
export type SearchField = 'all' | 'name' | 'version' | 'maintainer' | 'description';
export type SourceType = 'ext' | 'own';

export interface PackageSource {
    type: SourceType;
    url: string;
}

export interface PackageData {
    name: string;
    version: string;
    release?: string;
    description?: string | null;
    maintainer?: string | null;
    homepage?: string | null;
    depends?: string[];
    required_by?: string[];
    last_update?: string;
    source?: PackageSource[];
}

export interface Package extends Required<Omit<PackageData, 'description' | 'maintainer' | 'homepage'>> {
    description: string | null;
    maintainer: string | null;
    maintainerEmail: string | null;
    homepage: string | null;
    _repo: RepositoryId;
    _searchIndex: Record<SearchField, string>;
}

export interface RepositoryDefinition {
    id: RepositoryId;
    url: string;
}

export interface CatalogLoadProgress {
    completed: number;
    successful: number;
    total: number;
}

export interface CatalogLoadResult {
    packages: Package[];
    loadedRepositoryIds: RepositoryId[];
    failedRepositoryIds: RepositoryId[];
}

export interface CatalogState {
    allPackages: Package[];
    filteredPackages: Package[];
    loadedRepositoryIds: RepositoryId[];
    activeRepo: RepositoryId | 'all';
    searchQuery: string;
    searchField: SearchField;
    sortBy: SortBy;
    displayedCount: number;
    isLoading: boolean;
}

export interface DependencyItem {
    name: string;
    exists: boolean;
}

export interface SourceTemplateItem extends PackageSource {
    shortUrl: string;
    label: string;
}

export interface RepositoryTab {
    id: RepositoryId;
    name: string;
    count: number;
}
