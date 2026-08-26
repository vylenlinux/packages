// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    CatalogLoadProgress,
    CatalogLoadResult,
    Package,
    RepositoryDefinition,
    RepositoryId
} from '../types.js';

import {
    loadRepository
} from './package-loader.js';

interface RepositoryLoadAttempt {
    id: RepositoryId;
    packages: Package[];
    succeeded: boolean;
}

export async function loadCatalog(repositories: RepositoryDefinition[], onProgress: (progress: CatalogLoadProgress) => void): Promise<CatalogLoadResult> {
    let completed:  number = 0;
    let successful: number = 0;

    const attempts: RepositoryLoadAttempt[] = await Promise.all(repositories.map(async (repository: RepositoryDefinition): Promise<RepositoryLoadAttempt> => {
        try {
            const packages: Package[] = await loadRepository(repository);
            successful += 1;

            return {
                id: repository.id,
                packages,
                succeeded: true
            };
        } catch (error) {
            console.warn(`Failed to load ${repository.id}`, error);

            return {
                id: repository.id,
                packages: [],
                succeeded: false
            };
        } finally {
            completed += 1;

            onProgress({
                completed,
                successful,
                total: repositories.length
            });
        }
    }));

    const loadedAttempts: RepositoryLoadAttempt[] = attempts.filter((attempt: RepositoryLoadAttempt): boolean => attempt.succeeded);

    return {
        packages: loadedAttempts.flatMap((attempt: RepositoryLoadAttempt): Package[] => attempt.packages),
        loadedRepositoryIds: loadedAttempts.map((attempt: RepositoryLoadAttempt): RepositoryId => attempt.id),
        failedRepositoryIds: attempts.filter((attempt: RepositoryLoadAttempt): boolean => !attempt.succeeded).map((attempt: RepositoryLoadAttempt): RepositoryId => attempt.id)
    };
}
