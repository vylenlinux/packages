// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    RepositoryDefinition,
    SourceType
} from './types';

export function defineRepository(id: string): RepositoryDefinition {
    return {
        id,
        url: `https://codeberg.org/api/v1/repos/vylen/${id}/contents/packages.json`
    };
}

export const CODEBERG_BASE: string = 'https://codeberg.org/vylen';
export const ITEMS_PER_PAGE: number = 50;

export const REPOSITORIES: readonly RepositoryDefinition[] = [
    defineRepository('core'),
    defineRepository('extra'),
    defineRepository('community')
];

export const SOURCE_LABELS: Record<SourceType, string> = {
    ext: 'External',
    own: 'Own'
};
