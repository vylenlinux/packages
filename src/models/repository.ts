// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export interface RepoConfig {
    [key: string]: string;
}

export const REPO_CONFIG: RepoConfig = {};
for (const name of ['main', 'community', 'multilib']) REPO_CONFIG[name] = `https://gitlab.com/api/v4/projects/vylen%2Fports%2F${name}/repository/files/packages.json/raw`
