// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    Toast
} from '../components/toast.js';

export class ClipboardService {
    private toast: Toast;

    constructor() {
        this.toast = new Toast();
    }

    async copy(text: string): Promise<void> {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                this.toast.show(`Copied: ${text}`);

                return;
            }

            this.fallbackCopy(text);
        } catch (err) {
            try {
                this.fallbackCopy(text);
            } catch (fallbackErr) {
                this.toast.show('Failed to copy');
            }
        }
    }

    async copyWithFeedback(text: string, element: HTMLElement): Promise<void> {
        await this.copy(text);

        const original: string = element.innerHTML;
        element.classList.add('copied');

        element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>

        Copied!`;

        setTimeout((): void => {
            element.classList.remove('copied');
            element.innerHTML = original;
        }, 2000);
    }

    private fallbackCopy(text: string): void {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const successful: boolean = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (!successful) throw new Error('execCommand failed');
        this.toast.show(`Copied: ${text}`);
    }
}
