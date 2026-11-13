// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    Package,
    PackageData,
    PackageSource,
    RepositoryDefinition,
    SearchField
} from '../types.js';

import {
    extract_maintainer,
    normalizeSearchText,
    normalizeVersion
} from '../features/catalog/normalization.js';

function normalizePackage(data: PackageData, repository: RepositoryDefinition): Package {
    const name: string = String(data.name || '').trim();
    const version: string = String(data.version || 'unknown');
    const release: string = (data.release ? String(data.release) : '');
    const description: string | null = (data.description ? String(data.description) : null);
    const rawMaintainer: string | null = (data.maintainer ? String(data.maintainer).trim() : null);
    const maintainerEmail: string | null = extract_maintainer(rawMaintainer);
    const maintainer: string | null = (rawMaintainer && (maintainerEmail ? (rawMaintainer.replace(maintainerEmail, '').replace(/[<>]/g, '').trim() || maintainerEmail) : rawMaintainer));

    const searchIndex: Record<SearchField, string> = {
        all: normalizeSearchText(`${name} ${version} ${release} ${description || ''} ${maintainer || ''}`),
        name: normalizeSearchText(name),
        version: normalizeVersion(`${version}${release ? `-${release}` : ''}`),
        maintainer: normalizeSearchText(maintainer || ''),
        description: normalizeSearchText(description || '')
    };

    return {
        name,
        version,
        release,
        description,
        maintainer,
        maintainerEmail,

        homepage: (data.homepage ? String(data.homepage) : null),
        depends: (Array.isArray(data.depends) ? data.depends.map(String) : []),
        required_by: (Array.isArray(data.required_by) ? data.required_by.map(String) : []),
        last_update: (data.last_update ? String(data.last_update) : 'Unknown'),
        source: (Array.isArray(data.source) ? data.source.filter((source: PackageSource): source is PackageSource => Boolean(source?.url)) : []),
        _repo: repository.id,
        _searchIndex: searchIndex
    };
}

export async function loadRepository(repository: RepositoryDefinition): Promise<Package[]> {
    const response: Response = await fetch(repository.url, {
        headers: {
            Accept: 'application/json'
        }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${repository.id}`);
    const responseData: unknown = await response.json();
    let data: unknown = responseData;

    if (responseData && (typeof responseData === 'object') && ('content' in responseData)) {
        const apiFile = responseData as {
            content?: unknown;
            encoding?: unknown;
        };

        if ((apiFile.encoding !== 'base64') || (typeof apiFile.content !== 'string')) {
            throw new Error(`Invalid Codeberg API response for ${repository.id}`);
        }

        const binary: string = atob(apiFile.content.replace(/\s/g, ''));
        const bytes: Uint8Array = Uint8Array.from(binary, (character: string): number => character.charCodeAt(0));

        data = JSON.parse(new TextDecoder().decode(bytes));
    }

    if (!Array.isArray(data)) throw new Error(`Invalid data format for ${repository.id}`);
    return data.filter((item: any): item is PackageData => Boolean(item && (typeof item === 'object'))).map((item: PackageData): Package => normalizePackage(item, repository)).filter((item: Package): boolean => (item.name.length > 0));
}
