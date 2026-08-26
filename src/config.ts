// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    RepositoryDefinition,
    SourceType
} from './types';

export function defineRepository(id: string, url: string): RepositoryDefinition {
    return {
        id,
        url
    };
}

export const GITLAB_BASE: string = 'https://gitlab.com/vylen/ports';
export const ITEMS_PER_PAGE: number = 50;

export const REPOSITORIES: readonly RepositoryDefinition[] = [
    defineRepository('core', 'https://gitlab.com/api/v4/projects/vylen%2Fports%2Fcore/repository/files/packages.json/raw'),
    defineRepository('extra', 'https://gitlab.com/api/v4/projects/vylen%2Fports%2Fextra/repository/files/packages.json/raw'),
    defineRepository('community', 'https://gitlab.com/api/v4/projects/vylen%2Fports%2Fcommunity/repository/files/packages.json/raw')
];

export const SOURCE_LABELS: Record<SourceType, string> = {
    url: 'URL',
    git: 'Git',
    file: 'File',
    rename: 'Rename'
};
