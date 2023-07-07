export function Throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timerId: ReturnType<typeof setTimeout> | null;
    return function (this: unknown, ...args: Parameters<T>) {
        if (!timerId) {
            timerId = setTimeout(() => {
                fn.apply(this, args);
                timerId = null;
            }, delay);
        }
    } as T;
}

export function Debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timerId: ReturnType<typeof setTimeout> | null;
    return function (this: unknown, ...args: Parameters<T>) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn.apply(this, args);
            timerId = null;
        }, delay);
    } as T;
}


export function DebounceImmediate<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timerId: ReturnType<typeof setTimeout> | null;
    let lastArgs: Parameters<T> | null;
    let lastThis: unknown;
    let lastCalledTime = 0;
    return function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = now - lastCalledTime;
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (remaining >= delay) {
            lastCalledTime = now;
            fn.apply(this, args);
        } else {
            lastArgs = args;
            lastThis = this;
            timerId = setTimeout(() => {
                lastCalledTime = Date.now();
                fn.apply(lastThis, lastArgs!);
                lastArgs = null;
                lastThis = null;
                timerId = null;
            }, delay - remaining);
        }
    } as T;
}

