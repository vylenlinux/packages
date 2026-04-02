// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    Theme
} from '../models/state.js';

export function initTheme(): void {
    const saved: string = (localStorage.getItem('theme') || 'dark');
    document.documentElement.setAttribute('data-theme', saved);

    document.querySelector('.theme-toggle')?.addEventListener('click', (): void => {
        const html: HTMLElement = document.documentElement;
        const current: string = html.getAttribute('data-theme')!;
        const next: Theme = ((current === 'dark') ? 'light' : 'dark');

        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}
