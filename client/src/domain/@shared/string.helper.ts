/**
 * Normalizes a string by converting it to lowercase and removing accents.
 */
export function normalizeString(value: string): string {
    return String(value)
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Checks if a search term matches any property of an object.
 */
export function matchesSearch(item: Record<string, unknown>, searchTerm: string, keys: string[]): boolean {
    if (!searchTerm) return true;

    const normalizedSearch = normalizeString(searchTerm);

    return keys.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        
        return normalizeString(String(value)).includes(normalizedSearch);
    });
}
