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

export class PackageModal {
    private readonly modal: HTMLElement;
    private title: HTMLElement;
    private body: HTMLElement;
    private clipboard: ClipboardService;
    private scrollPosition: number = 0;

    private readonly onDependencyClick: (dep: string) => void;

    constructor(onDependencyClick: (dep: string) => void) {
        this.modal = document.getElementById('modal')!;
        this.title = document.getElementById('modal-title')!;
        this.body = document.getElementById('modal-body')!;
        this.clipboard = new ClipboardService();

        this.onDependencyClick = onDependencyClick;
        this.initListeners();
    }

    show(pkg: Package): void {
        this.scrollPosition = window.scrollY;
        window.location.hash = pkg.name;

        const gitlabUrl: string = `${GITLAB_BASE}/${pkg._repo}/-/tree/main/${pkg.name}`;
        this.title.textContent = pkg.name;

        this.body.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Version</div>

                <div class="detail-value">
                    <code>${escapeHtml(pkg.version)}${pkg.release ? `-${pkg.release}` : ''}</code>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Repository</div>
                <div class="detail-value">${pkg._repo}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${escapeHtml(pkg.description || 'No description')}</div>
            </div>

            ${pkg.maintainer ? `
                <div class="detail-row">
                    <div class="detail-label">Maintainer</div>
                    <div class="detail-value">${escapeHtml(pkg.maintainer)}</div>
                </div>
            ` : ''}

            ${pkg.homepage ? `
                <div class="detail-row">
                    <div class="detail-label">Homepage</div>

                    <div class="detail-value">
                        <a href="${escapeHtml(pkg.homepage)}" target="_blank" rel="noopener" style="color: var(--accent);">${escapeHtml(pkg.homepage)}</a>
                    </div>
                </div>
            ` : ''}

            <div class="detail-install">
                <div class="detail-label">Install Command</div>
                <code>emerald install ${pkg.name}</code>

                <button class="copy-btn" data-action="copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>

                    Copy
                </button>
            </div>

            <div class="detail-row">
                <div class="detail-label">Source Code</div>

                <div class="detail-value">
                    <a href="${gitlabUrl}" target="_blank" rel="noopener" style="color: var(--accent); display: inline-flex; align-items: center; gap: 0.5rem;">
                        <svg width="16" height="16" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="16 28.896 16 28.896 21.156 13.029 10.844 13.029 16 28.896" style="fill:#e24329" />
                            <polygon points="16 28.896 10.844 13.029 3.619 13.029 16 28.896" style="fill:#fc6d26" />

                            <path d="M3.619,13.029h0L2.052,17.851a1.067,1.067,0,0,0,.388,1.193L16,28.9,3.619,13.029Z" style="fill:#fca326" />
                            <path d="M3.619,13.029h7.225L7.739,3.473a.534.534,0,0,0-1.015,0L3.619,13.029Z" style="fill:#e24329" />

                            <polygon points="16 28.896 21.156 13.029 28.381 13.029 16 28.896" style="fill:#fc6d26" />

                            <path d="M28.381,13.029h0l1.567,4.822a1.067,1.067,0,0,1-.388,1.193L16,28.9,28.381,13.029Z" style="fill:#fca326" />
                            <path d="M28.381,13.029H21.156l3.105-9.557a.534.534,0,0,1,1.015,0l3.105,9.557Z" style="fill:#e24329" />
                        </svg>

                        View on GitLab →
                    </a>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Dependencies (${pkg.depends.length})</div>

                <div class="detail-value depends-list">
                    ${pkg.depends.length ? pkg.depends.map((d: string): string => `<span class="tag dependency" data-dep="${escapeHtml(d)}">${escapeHtml(d)}</span>`).join('') : '<span style="color: var(--text-secondary);">None</span>'}
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Required By (${pkg.required_by.length})</div>

                <div class="detail-value depends-list">
                    ${pkg.required_by.length ? pkg.required_by.map((d: string): string => `<span class="tag dependency" data-dep="${escapeHtml(d)}">${escapeHtml(d)}</span>`).join('') : '<span style="color: var(--text-secondary);">None</span>'}
                </div>
            </div>
        `;

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.body.querySelector('[data-action="copy"]')?.addEventListener('click', (): void => {
            this.clipboard.copy(`emerald install ${pkg.name}`).then((): void => console.log('Copied!'));
        });

        this.body.querySelectorAll('[data-dep]').forEach((el: Element): void => {
            el.addEventListener('click', (e: Event): void => {
                const dep: string = (e.target as HTMLElement).dataset.dep!;

                this.close();
                this.onDependencyClick(dep);
            });
        });
    }

    close(): void {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        history.pushState('', document.title, (window.location.pathname + window.location.search));
        window.scrollTo(0, this.scrollPosition);
    }

    private initListeners(): void {
        this.modal.addEventListener('click', (e: PointerEvent): void => {
            if (e.target === this.modal) this.close();
        });

        document.querySelector('.close-btn')?.addEventListener('click', (): void => this.close());
    }
}
