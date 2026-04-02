// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    REPO_CONFIG
} from '../models/repository.js';

import {
    Package
} from '../models/package.js';

export class RepoTabs {
    private container: HTMLElement;
    private readonly onSelect: (repo: string) => void;

    constructor(containerId: string, onSelect: (repo: string) => void) {
        this.container = document.getElementById(containerId)!;
        this.onSelect = onSelect;
    }

    render(packages: Package[]): void {
        const repoCounts: Record<string, number> = this.countRepos(packages);

        this.container.innerHTML = `
            <div class="repo-tab active" data-repo="all" role="button" tabindex="0">
                All <span class="count">${packages.length}</span>
            </div>

            ${Object.keys(REPO_CONFIG).map((repo: string): string => `
                <div class="repo-tab" data-repo="${repo}" role="button" tabindex="0">
                    ${repo} <span class="count">${repoCounts[repo] || 0}</span>
                </div>
            `).join('')}
        `;

        this.container.classList.add('loaded');
        this.attachListeners();
    }

    setActive(repo: string): void {
        this.container.querySelectorAll('.repo-tab').forEach((tab: Element): void => {
            tab.classList.toggle('active', tab.getAttribute('data-repo') === repo);
        });
    }

    private countRepos(packages: Package[]): Record<string, number> {
        const counts: Record<string, number> = {};

        packages.forEach((pkg: Package): void => {
            counts[pkg._repo] = (counts[pkg._repo] || 0) + 1;
        });

        return counts;
    }

    private attachListeners(): void {
        this.container.addEventListener('click', (e: PointerEvent): void => {
            const tab: Element | null = (e.target as HTMLElement).closest('.repo-tab');
            if (!tab) return;

            const repo: string = tab.getAttribute('data-repo')!;
            this.setActive(repo);
            this.onSelect(repo);
        });
    }
}
