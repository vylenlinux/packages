// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    AppState,
    initialState,
    SortBy
} from './models/state.js';

import {
    ApiService
} from './services/api.js';

import {
    SearchService
} from './services/search.js';

import {
    RepoTabs
} from './components/repo-tabs.js';

import {
    PackageCard
} from './components/package-card.js';

import {
    PackageModal
} from './components/package-modal.js';

import {
    SearchBar
} from './components/search-bar.js';

import {
    ITEMS_PER_PAGE
} from './config.js';

import {
    initTheme
} from './utils/theme.js';

import {
    Package
} from "./models/package.js";

import {
    REPO_CONFIG
} from './models/repository.js';

class App {
    private readonly state: AppState;
    private api: ApiService;
    private searchService: SearchService;
    private repoTabs!: RepoTabs;
    private packageCard!: PackageCard;
    private modal!: PackageModal;
    private searchBar!: SearchBar;

    private elements!: {
        loading:       HTMLElement;
        error:         HTMLElement;
        packageList:   HTMLElement;
        container:     HTMLElement;
        sentinel:      HTMLElement;
        emptyState:    HTMLElement;
        totalPackages: HTMLElement;
        totalRepos:    HTMLElement;
        loadedRepos:   HTMLElement;
    };

    constructor() {
        this.state = { ...initialState };
        this.api = new ApiService();
        this.searchService = new SearchService();

        this.initElements();
        this.initComponents();
        this.initKeyboardShortcuts();
    }

    private initElements(): void {
        this.elements = {
            loading:       document.getElementById('loading')!,
            error:         document.getElementById('error')!,
            packageList:   document.getElementById('package-list')!,
            container:     document.getElementById('packages-container')!,
            sentinel:      document.getElementById('sentinel')!,
            emptyState:    document.getElementById('empty-state')!,
            totalPackages: document.getElementById('total-packages')!,
            totalRepos:    document.getElementById('total-repos')!,
            loadedRepos:   document.getElementById('loaded-repos')!
        };
    }

    private initComponents(): void {
        this.repoTabs = new RepoTabs('repo-tabs', (repo: string): void => {
            this.state.activeRepo = repo;
            this.filterAndRender();
        });

        this.packageCard = new PackageCard((pkg: Package): void => {
            this.modal.show(pkg);
        });

        this.modal = new PackageModal((dep: string): void => {
            this.state.activeRepo = 'all';
            this.repoTabs.setActive('all');

            this.searchBar.setValue(dep);
            this.state.searchQuery = dep.toLowerCase();
            this.filterAndRender();
            this.searchBar.focus();
        });

        this.searchBar = new SearchBar((query: string): void => {
            this.state.searchQuery = query;
            this.filterAndRender();
        }, (sort: SortBy): void => {
            this.searchService.sort(this.state, sort);
            this.state.displayedCount = 0;
            this.elements.container.innerHTML = '';

            this.loadMore();
        });
    }

    private initKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e: KeyboardEvent): void => {
            if (e.key === 'Escape') this.modal.close();

            if (e.key === '/') {
                const target: HTMLElement = e.target as HTMLElement;

                if (target.tagName !== 'INPUT') {
                    e.preventDefault();
                    this.searchBar.focus();
                }
            }
        });
    }

    async init(): Promise<void> {
        this.elements.totalRepos.textContent = Object.keys(REPO_CONFIG).length.toString();

        try {
            this.state.allPackages = await this.api.loadRepositories((loaded: number): void => {
                this.elements.loadedRepos.textContent = loaded.toString();
            });

            this.elements.loading.classList.add('hidden');

            if (this.state.allPackages.length === 0) {
                this.showError('Failed to load any packages');
                return;
            }

            this.elements.totalPackages.textContent = this.state.allPackages.length.toLocaleString();
            this.elements.packageList.classList.remove('hidden');
            this.searchBar.enable();

            this.repoTabs.render(this.state.allPackages);
            initTheme();

            this.filterAndRender();
            this.initInfiniteScroll();
            this.handleInitialUrl();
        } catch (err) {
            this.showError('Failed to initialize application');
            console.error(err);
        }
    }

    private handleInitialUrl(): void {
        const hash: string = window.location.hash.slice(1);

        if (hash) {
            const pkg: Package | undefined = this.state.allPackages.find((p: Package): boolean => p.name === hash);
            if (pkg) this.modal.show(pkg);
        }

        window.addEventListener('hashchange', (): void => {
            const name: string = window.location.hash.slice(1);

            if (!name) {
                this.modal.close();
                return;
            }

            const pkg: Package | undefined = this.state.allPackages.find((p: Package): boolean => p.name === name);
            if (pkg) this.modal.show(pkg);
        });
    }

    private filterAndRender(): void {
        this.searchService.filter(this.state);
        this.state.displayedCount = 0;
        this.elements.container.innerHTML = '';

        if (this.state.filteredPackages.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.sentinel.classList.add('hidden');

            return;
        }

        this.elements.emptyState.classList.add('hidden');
        this.elements.sentinel.classList.remove('hidden');

        this.loadMore();
    }

    private loadMore(): void {
        if (this.state.isLoading) return;
        this.state.isLoading = true;

        const start: number = this.state.displayedCount;
        const end:   number = Math.min(start + ITEMS_PER_PAGE, this.state.filteredPackages.length);

        const fragment: DocumentFragment = document.createDocumentFragment();
        for (let i: number = start; i < end; i++) fragment.appendChild(this.packageCard.create(this.state.filteredPackages[i]));

        this.elements.container.appendChild(fragment);
        this.state.displayedCount = end;

        if (this.state.displayedCount >= this.state.filteredPackages.length) this.elements.sentinel.classList.add('hidden');
        this.state.isLoading = false;
    }

    private initInfiniteScroll(): void {
        const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
            if (entries[0].isIntersecting && !this.state.isLoading) this.loadMore();
        }, {
            rootMargin: '100px'
        });

        observer.observe(this.elements.sentinel);
    }

    private showError(msg: string): void {
        this.elements.error.textContent = msg;
        this.elements.error.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', (): void => {
    new App().init().then((): void => console.log('App initialized'));
});
