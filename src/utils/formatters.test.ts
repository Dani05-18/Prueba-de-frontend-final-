import { describe, it, expect } from 'vitest';
import { formatToCurrency } from './formatters';

describe('formatToCurrency', () => {
    it('debería formatear correctamente un número entero a moneda', () => {
        const result = formatToCurrency(150000);
        // Validamos que contenga la parte numérica esperada ignorando un poco los espacios localizados
        expect(result).toMatch(/150\.000|150,000/);
    });

    it('debería manejar el valor 0 de forma correcta', () => {
        const result = formatToCurrency(0);
        expect(result).toMatch(/0/);
    });
});
