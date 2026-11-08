// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    GITLAB_BASE,
    SOURCE_LABELS
} from '../../config.js';

import type {
    DependencyItem,
    Package,
    PackageSource,
    SourceTemplateItem,
    SourceType
} from '../../types.js';

import {
    copyText
} from '../../shared/clipboard.js';

import {
    element
} from '../../shared/dom.js';

import {
    templateEnvironment,
    templates
} from '../../shared/templates.js';

import type {
    Toast
} from '../../shared/toast.js';

export class ModalController {
    private readonly modal: HTMLElement = element<HTMLElement>('#modal');
    private readonly modalContent: HTMLElement = element<HTMLElement>('.modal-content');
    private readonly modalKicker: HTMLElement = element<HTMLElement>('.modal-kicker');
    private readonly modalTitle: HTMLElement = element<HTMLElement>('#modal-title');
    private readonly modalBody: HTMLElement = element<HTMLElement>('#modal-body');
    private readonly closeButton: HTMLButtonElement = element<HTMLButtonElement>('.close-btn');

    private pageScrollPosition: number = 0;

    private packages: Package[];
    private permalinkMode: 'hash' | 'query' = 'hash';

    constructor(packages: Package[], private readonly toast: Toast) {
        this.packages = packages;
    }

    bindEvents(): void {
        this.modal.addEventListener('click', (event: PointerEvent): void => {
            if (event.target === this.modal) this.close(true);
        });

        this.closeButton.addEventListener('click', (): void => this.close(true));
        this.modalBody.addEventListener('click', (event: PointerEvent): void => this.handleBodyClick(event));
    }

    isOpen(): boolean {
        return this.modal.classList.contains('active');
    }

    open(name: string, updateLocation: boolean = true): void {
        const pkg: Package | undefined = this.packages.find((candidate: Package): boolean => (candidate.name === name));

        if (!pkg) {
            if (!this.isOpen()) this.pageScrollPosition = window.scrollY;

            this.modalKicker.textContent = 'Package lookup';
            this.modalTitle.textContent = 'Package not found';

            const message: HTMLElement = document.createElement('p');
            message.className = 'muted-copy';
            message.textContent = `No package named “${name}” was found. Check the package name or return to the catalog and try again.`;

            this.modalBody.replaceChildren(message);
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.resetContentScroll();

            return;
        }

        if (!this.isOpen()) this.pageScrollPosition = window.scrollY;
        const packageNames = new Set(this.packages.map((item: Package): string => item.name));
        const dependencyItems: DependencyItem[] = this.toDependencyItems(pkg.depends, packageNames);
        const requiredByItems: DependencyItem[] = this.toDependencyItems(pkg.required_by, packageNames);
        const sourceItems: SourceTemplateItem[] = this.toSourceItems(pkg);

        this.modalKicker.textContent = 'Package details';
        this.modalTitle.textContent = pkg.name;

        this.modalBody.innerHTML = templateEnvironment.renderString(templates.packageDetails, {
            package: pkg,
            gitlabBase: GITLAB_BASE,

            dependencyItems,
            requiredByItems,
            sourceItems
        });

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetContentScroll();

        if (updateLocation) this.updatePackageLocation(pkg.name);
    }

    openFromUrl(): void {
        const url: URL = new URL(window.location.href);
        const queryName: string | null = url.searchParams.get('package');

        if (queryName !== null) {
            this.permalinkMode = 'query';
            this.open(queryName, false);

            return;
        }

        const encodedName: string = window.location.hash.slice(1);

        if (!encodedName) {
            this.permalinkMode = 'hash';
            if (this.isOpen()) this.close(false);

            return;
        }

        this.permalinkMode = 'hash';

        try {
            this.open(decodeURIComponent(encodedName), false);
        } catch {
            if (this.isOpen()) this.close(false);
        }
    }

    close(clearLocation: boolean): void {
        if (!this.isOpen()) return;

        this.resetContentScroll();
        this.modal.classList.remove('active');

        document.body.style.overflow = '';
        if (clearLocation) this.clearPackageLocation();

        window.scrollTo(0, this.pageScrollPosition);
    }

    private resetContentScroll(): void {
        this.modalContent.scrollTop = 0;

        window.requestAnimationFrame((): void => {
            this.modalContent.scrollTop = 0;
        });
    }

    private updatePackageLocation(packageName: string): void {
        const url: URL = new URL(window.location.href);

        if (this.permalinkMode === 'query') {
            url.searchParams.set('package', packageName);
            url.hash = '';
        } else {
            url.hash = encodeURIComponent(packageName);
        }

        const nextLocation: string = `${url.pathname}${url.search}${url.hash}`;
        const currentLocation: string = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (currentLocation !== nextLocation) history.pushState('', document.title, nextLocation);
    }

    private clearPackageLocation(): void {
        const url: URL = new URL(window.location.href);
        url.searchParams.delete('package');
        url.hash = '';

        const nextLocation: string = `${url.pathname}${url.search}${url.hash}`;
        const currentLocation: string = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (currentLocation !== nextLocation) history.pushState('', document.title, nextLocation);
    }

    private toDependencyItems(names: string[], packageNames: Set<string>): DependencyItem[] {
        return names.map((name: string): {
            name: string;
            exists: boolean;
        } => ({
            name,
            exists: packageNames.has(name)
        }));
    }

    private toSourceItems(pkg: Package): SourceTemplateItem[] {
        return pkg.source.map((source: PackageSource): {
            label: string;
            shortUrl: string;
            type: SourceType;
            url: string;
            rename?: string;
        } => ({
            ...source,
            label: (SOURCE_LABELS[source.type] || 'File'),
            shortUrl: ((source.url.length > 60) ? `${source.url.slice(0, 57)}...` : source.url)
        }));
    }

    private handleBodyClick(event: MouseEvent): void {
        const target: Element = event.target as Element;
        const copyTarget: HTMLElement | null = target.closest<HTMLElement>('[data-copy-command]');

        if (copyTarget) {
            void this.copyFromTarget(copyTarget);
            return;
        }

        const dependency: HTMLElement | null = target.closest<HTMLElement>('[data-dependency]');
        if (dependency?.dataset.dependency) this.open(dependency.dataset.dependency);
    }

    private async copyFromTarget(target: HTMLElement): Promise<void> {
        const command: string | undefined = target.dataset.copyCommand;
        if (!command) return;

        this.toast.show((await copyText(command)) ? `Copied: ${command}` : 'Failed to copy');
    }
}
