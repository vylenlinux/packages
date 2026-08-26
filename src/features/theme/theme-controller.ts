// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    element
} from '../../shared/dom.js';

export class ThemeController {
    private readonly button: HTMLButtonElement = element<HTMLButtonElement>('.theme-toggle');

    initialize(): void {
        const savedTheme: string = (localStorage.getItem('theme') || 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);

        this.button.addEventListener('click', (): void => this.toggle());
    }

    private toggle(): void {
        const currentTheme: string = (document.documentElement.getAttribute('data-theme') || 'dark');
        const nextTheme: 'dark' | 'light' = ((currentTheme === 'dark') ? 'light' : 'dark');

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
    }
}
