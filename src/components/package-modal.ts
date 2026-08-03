// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
    Package,
    PackageSource
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
    private packages: Map<string, Package> = new Map();

    constructor(packages: Package[]) {
        this.modal = document.getElementById('modal')!;
        this.title = document.getElementById('modal-title')!;
        this.body = document.getElementById('modal-body')!;
        this.clipboard = new ClipboardService();
        this.packages = new Map(packages.map((pkg: Package): [string, Package] => [pkg.name, pkg]));

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

            <div class="detail-row">
                <div class="detail-label">Last Modified</div>
                <div class="detail-value">${escapeHtml(pkg.last_update)}</div>
            </div>

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

            <div class="detail-row sources-section">
                <div class="detail-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>

                    Sources (${pkg.source.length})
                </div>

                <div class="detail-value sources-list">
                    ${pkg.source.length ? pkg.source.map((src: PackageSource, index: number): string => this.renderSource(src, index)).join('') : '<span class="no-sources">No sources</span>'}
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Dependencies (${pkg.depends.length})</div>

                <div class="detail-value depends-list">
                    ${pkg.depends.length ? pkg.depends.map((d: string): string => this.renderDependency(d)).join('') : '<span style="color: var(--text-secondary);">None</span>'}
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Required By (${pkg.required_by.length})</div>

                <div class="detail-value depends-list">
                    ${pkg.required_by.length ? pkg.required_by.map((d: string): string => this.renderDependency(d)).join('') : '<span style="color: var(--text-secondary);">None</span>'}
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
                window.location.hash = dep;
            });
        });

        this.body.querySelectorAll('.source-copy-btn').forEach((btn: Element): void => {
            btn.addEventListener('click', (e: Event): void => {
                const url: string = (e.currentTarget as HTMLElement).dataset.url!;
                this.clipboard.copy(url).then((): void => console.log('Source URL copied!'));
            });
        });
    }

    private renderDependency(dep: string): string {
        const exists: boolean = this.packages.has(dep);
        return `<span class="tag dependency ${exists ? '' : 'dependency-missing'}" ${exists ? `data-dep="${escapeHtml(dep)}"` : ''}>${escapeHtml(dep)}</span>`;
    }

    private renderSource(src: PackageSource, index: number): string {
        const typeIcons: Record<string, string> = {
            url: `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
            `,

            git: `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="6" cy="18" r="3" />

                    <circle cx="6" cy="6" r="3" />
                    <line x1="18" y1="9" x2="6" y2="9" />

                    <circle cx="18" cy="18" r="3" />
                    <line x1="18" y1="21" x2="18" y2="15" />
                </svg>
            `,

            file: `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />

                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            `,

            rename: `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            `
        };

        const typeLabels: Record<string, string> = {
            url: 'URL',
            git: 'Git',
            file: 'File',
            rename: 'Rename'
        };

        const displayUrl: string = escapeHtml(src.url);
        const shortUrl:   string = ((displayUrl.length > 60) ? (displayUrl.substring(0, 57) + '...') : displayUrl);

        return `
            <div class="source-item">
                <div class="source-icon source-icon--${src.type}">
                    ${typeIcons[src.type] || typeIcons.file}
                </div>

                <div class="source-info">
                    <div class="source-header">
                        <span class="source-type-badge source-type-badge--${src.type}">${typeLabels[src.type]}</span>
                        <span class="source-index">#${index + 1}</span>
                    </div>

                    <div class="source-url">
                        <a href="${displayUrl}" target="_blank" rel="noopener">${shortUrl}</a>
                    </div>

                    ${src.rename ? `
                        <div class="source-rename">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14" />
                                <path d="M12 5l7 7-7 7" />
                            </svg>

                            <span>
                                → <code>${escapeHtml(src.rename)}</code>
                            </span>
                        </div>
                    ` : ''}
                </div>

                <button class="source-copy-btn" data-url="${escapeHtml(src.url)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                </button>
            </div>
        `;
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
