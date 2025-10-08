export function getStorageItem(key: string, defaultValue: string = ''): string {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch {
        return defaultValue;
    }
}

export function setStorageItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        throw new Error(`Error: Failed to set item in localStorage - ${error}`);
    }
}
