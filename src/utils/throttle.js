// src/utils/throttle.js

// Esta função garante que outra função (func) não seja executada mais de uma vez
// dentro de um determinado período de tempo (limit), melhorando a performance.
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}