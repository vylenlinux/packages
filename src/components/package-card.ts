// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    Package
} from '../models/package.js';

import {
    GITLAB_BASE
} from '../config.js';

import {
    escapeHtml
} from '../utils/html.js';

import {
    ClipboardService
} from '../services/clipboard.js';

export class PackageCard {
    private clipboard: ClipboardService;
    private readonly onClick: (pkg: Package) => void;
    private copyTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(onClick: (pkg: Package) => void) {
        this.clipboard = new ClipboardService();
        this.onClick = onClick;
    }

    create(pkg: Package): HTMLElement {
        const div: HTMLDivElement = document.createElement('div');
        div.className = 'package-item';

        const deps: string[] = (pkg.depends || []);
        const gitlabUrl: string = `${GITLAB_BASE}/${pkg._repo}/-/tree/main/${pkg.name}`;

        div.innerHTML = `
            <div class="package-header">
                <div class="package-name">
                    📦 ${escapeHtml(pkg.name)}
                    <span class="repo-badge">${pkg._repo}</span>
                </div>

                <span class="package-version">${escapeHtml(pkg.version)}${pkg.release ? `-${pkg.release}` : ''}</span>
            </div>

            <div class="package-meta">
                ${pkg.maintainer ? `<span>👤 ${escapeHtml(pkg.maintainer)}</span>` : ''}
                <span>📋 ${deps.length} deps</span>
            </div>

            <div class="package-description">${escapeHtml(pkg.description || 'No description')}</div>

            <div class="package-actions">
                <div class="install-cmd" data-action="copy" data-cmd="emerald install ${pkg.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>

                    emerald install ${escapeHtml(pkg.name)}
                </div>

                <a href="${gitlabUrl}" target="_blank" rel="noopener" class="gitlab-link" onclick="event.stopPropagation()">
                    <svg width="16" height="16" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="16 28.896 16 28.896 21.156 13.029 10.844 13.029 16 28.896" style="fill:#e24329" />
                        <polygon points="16 28.896 10.844 13.029 3.619 13.029 16 28.896" style="fill:#fc6d26" />

                        <path d="M3.619,13.029h0L2.052,17.851a1.067,1.067,0,0,0,.388,1.193L16,28.9,3.619,13.029Z" style="fill:#fca326" />
                        <path d="M3.619,13.029h7.225L7.739,3.473a.534.534,0,0,0-1.015,0L3.619,13.029Z" style="fill:#e24329" />

                        <polygon points="16 28.896 21.156 13.029 28.381 13.029 16 28.896" style="fill:#fc6d26" />

                        <path d="M28.381,13.029h0l1.567,4.822a1.067,1.067,0,0,1-.388,1.193L16,28.9,28.381,13.029Z" style="fill:#fca326" />
                        <path d="M28.381,13.029H21.156l3.105-9.557a.534.534,0,0,1,1.015,0l3.105,9.557Z" style="fill:#e24329" />
                    </svg>

                    Source
                </a>
            </div>
        `;

        div.addEventListener('click', (): void => this.onClick(pkg));

        const cmdBtn: Element | null = div.querySelector('[data-action="copy"]');

        cmdBtn?.addEventListener('click', (e: Event): void => {
            e.stopPropagation();

            if (cmdBtn.classList.contains('copied')) return;
            if (this.copyTimeout) clearTimeout(this.copyTimeout);

            const cmd: string = `emerald install ${pkg.name}`;
            this.clipboard.copyWithFeedback(cmd, cmdBtn as HTMLElement).then((): void => console.log('Copied!'));

            this.copyTimeout = setTimeout((): void => {
                cmdBtn.classList.remove('copied');
            }, 2000);
        });

        return div;
    }
}
