// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    SortBy
} from '../models/state.js';

export class SearchBar {
    private input: HTMLInputElement;
    private select: HTMLSelectElement;

    private readonly onSearch: (query: string) => void;
    private readonly onSort: (sort: SortBy) => void;

    constructor(onSearch: (query: string) => void, onSort: (sort: SortBy) => void) {
        this.input = document.getElementById('search') as HTMLInputElement;
        this.select = document.getElementById('sort-by') as HTMLSelectElement;

        this.onSearch = onSearch;
        this.onSort = onSort;

        this.initListeners();
    }

    enable(): void {
        this.input.disabled = false;
        this.select.disabled = false;
    }

    setValue(value: string): void {
        this.input.value = value;
    }

    focus(): void {
        this.input.focus();
    }

    private initListeners(): void {
        let debounceTimer: number;

        this.input.addEventListener('input', (e: Event): void => {
            clearTimeout(debounceTimer);

            debounceTimer = window.setTimeout((): void => {
                this.onSearch((e.target as HTMLInputElement).value.toLowerCase().trim());
            }, 150);
        });

        this.select.addEventListener('change', (e: Event): void => {
            this.onSort((e.target as HTMLSelectElement).value as SortBy);
        });
    }
}
