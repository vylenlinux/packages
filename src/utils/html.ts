// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export function escapeHtml(text: string | null): string {
    if (!text) return '';
    const div: HTMLDivElement = document.createElement('div');
    div.textContent = text;

    return div.innerHTML;
}
