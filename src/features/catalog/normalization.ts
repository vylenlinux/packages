// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export function normalizeSearchText(value: string): string {
    return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function extract_maintainer(maintainer: string | null | undefined): string | null {
    if (!maintainer) return null;

    const emailMatch: RegExpMatchArray | null = maintainer.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu);
    return (emailMatch?.[0] ?? null);
}

export function normalizeVersion(value: string): string {
    return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().replace(/\s+/g, '').trim();
}
