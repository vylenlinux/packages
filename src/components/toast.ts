// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export class Toast {
    private element: HTMLElement;

    constructor() {
        this.element = document.getElementById('toast')!;
    }

    show(message: string): void {
        this.element.textContent = message;
        this.element.classList.add('show');

        setTimeout((): void => this.element.classList.remove('show'), 2000);
    }
}
