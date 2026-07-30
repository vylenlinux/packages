// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    Package,
    PackageData
} from '../models/package.js';

import {
    REPO_CONFIG
} from '../models/repository.js';

export class ApiService {
    async loadRepositories(onProgress: (loaded: number, total: number) => void): Promise<Package[]> {
        const repos: [string, string][] = Object.entries(REPO_CONFIG) as [string, string][];
        let loadedCount: number = 0;

        const loadRepo: ([name, url]: [string, string]) => Promise<Package[]> = async ([name, url]: [string, string]): Promise<Package[]> => {
            try {
                const response: Response = await fetch(url);

                if (!response.ok) {
                    console.warn(`Failed to load ${name}: HTTP ${response.status}`);
                    onProgress(loadedCount, repos.length);

                    return [];
                }

                const data: unknown = await response.json();

                if (!Array.isArray(data)) {
                    console.warn(`Failed to load ${name}: Invalid repo format`);
                    onProgress(loadedCount, repos.length);

                    return [];
                }

                loadedCount++;
                onProgress(loadedCount, repos.length);

                return data.map((pkg: PackageData): Package => this.enrichPackage(pkg, name));
            } catch (err) {
                console.warn(`Failed to load ${name}:`, err);
                onProgress(loadedCount, repos.length);

                return [];
            }
        };

        const results: Package[][] = await Promise.all(repos.map(loadRepo));
        return results.flat();
    }

    private enrichPackage(pkg: PackageData, repoName: string): Package {
        return {
            ...pkg,
            _repo: repoName,
            _searchable: `${pkg.name} ${pkg.description || ''} ${pkg.maintainer || ''}`.toLowerCase()
        };
    }
}
