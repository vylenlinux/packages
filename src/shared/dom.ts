// SPDX-FileCopyrightText: 2023 CELESTIFYX Team
// SPDX-License-Identifier: GPL-3.0-or-later

export function element<T extends Element>(selector: string): T {
    const found: T | null = document.querySelector<T>(selector);
    if (!found) throw new Error(`Missing required element: ${selector}`);

    return found;
}
