// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export class Toast {
    private timer: number | undefined;

    constructor(private readonly element: HTMLElement) {}

    show(message: string): void {
        window.clearTimeout(this.timer);

        this.element.textContent = message;
        this.element.classList.add('show');

        this.timer = window.setTimeout((): void => this.element.classList.remove('show'), 2200);
    }
}
