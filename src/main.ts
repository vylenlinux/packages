// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    REPOSITORIES
} from './config.js';

import {
    loadCatalog
} from './data/catalog-loader.js';

import {
    CatalogController
} from './features/catalog/catalog-controller.js';

import {
    CatalogView
} from './features/catalog/catalog-view.js';

import {
    ModalController
} from './features/modal/modal-controller.js';

import {
    ThemeController
} from './features/theme/theme-controller.js';

import {
    element
} from './shared/dom.js';

import {
    Toast
} from './shared/toast.js';

import type {
    CatalogLoadProgress,
    CatalogLoadResult
} from './types.js';

class PackageAtlasApp {
    private readonly catalogView: CatalogView = new CatalogView();
    private readonly toast: Toast = new Toast(element<HTMLElement>('#toast'));
    private readonly backToTop: HTMLButtonElement = element<HTMLButtonElement>('#back-to-top');
    private modal: ModalController | undefined;
    private catalog: CatalogController | undefined;

    async initialize(): Promise<void> {
        new ThemeController().initialize();
        this.bindGlobalEvents();

        try {
            await this.reloadCatalog();
        } catch (error) {
            console.error(error);
            this.catalogView.showError('Failed to load repository configuration');
        }
    }

    private async reloadCatalog(): Promise<void> {
        this.catalogView.setRepositoryProgress({
            completed: 0,
            successful: 0,
            total: REPOSITORIES.length
        });

        try {
            const loadResult: CatalogLoadResult = await loadCatalog([...REPOSITORIES], (progress: CatalogLoadProgress): void => this.catalogView.setRepositoryProgress(progress));

            this.modal = new ModalController(loadResult.packages, this.toast);
            this.modal.bindEvents();

            this.catalog = new CatalogController(this.catalogView, this.toast, (name: string): void => this.modal?.open(name));
            this.catalog.initialize(loadResult.packages, loadResult.loadedRepositoryIds, [...REPOSITORIES]);

            this.updateBackToTopVisibility();
            this.modal.openFromUrl();
        } catch (error) {
            console.error(error);
            this.catalogView.showError('Failed to load repositories');
        }
    }

    private bindGlobalEvents(): void {
        document.addEventListener('keydown', (event: KeyboardEvent): void => this.handleGlobalKeydown(event));

        window.addEventListener('scroll', (): void => this.updateBackToTopVisibility(), {
            passive: true
        });

        window.addEventListener('hashchange', (): void => this.modal?.openFromUrl());
        window.addEventListener('popstate', (): void => this.modal?.openFromUrl());

        this.backToTop.addEventListener('click', (): void => window.scrollTo({
            top: 0,
            behavior: 'smooth'
        }));
    }

    private handleGlobalKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            if (!this.modal?.isOpen()) {
                this.catalog?.clearSearch(true);
                return;
            }

            this.modal.close(true);
            return;
        }

        const activeTagName: string | undefined = document.activeElement?.tagName;

        if ((event.key === '/') && (activeTagName !== 'INPUT') && (activeTagName !== 'SELECT') && (activeTagName !== 'TEXTAREA')) {
            event.preventDefault();
            this.catalog?.focusSearch();
        }
    }

    private updateBackToTopVisibility(): void {
        this.backToTop.classList.toggle('is-visible', (window.scrollY > 560));
    }
}

document.addEventListener('DOMContentLoaded', (): void => {
    void new PackageAtlasApp().initialize();
});
