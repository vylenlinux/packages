// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import nunjucks from 'nunjucks';
// @ts-ignore
import packageCardTemplate from '../templates/components/package-card.njk';
// @ts-ignore
import packageDetailsTemplate from '../templates/components/package-details.njk';
// @ts-ignore
import repoTabsTemplate from '../templates/components/repo-tabs.njk';

export const templateEnvironment = new nunjucks.Environment([], {
    autoescape:       true,
    throwOnUndefined: true,
    trimBlocks:       true,
    lstripBlocks:     true
});

export const templates: {
    packageCard:    any
    packageDetails: any
    repositoryTabs: any
} = {
    packageCard: packageCardTemplate,
    packageDetails: packageDetailsTemplate,
    repositoryTabs: repoTabsTemplate
};
