// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export interface PackageData {
    name: string;
    version: string;
    release: string;
    description: string | null;
    maintainer: string | null;
    homepage: string | null;
    depends: string[];
    required_by: string[];
    last_update: string;
}

export interface Package extends PackageData {
    _repo: string;
    _searchable: string;
}
