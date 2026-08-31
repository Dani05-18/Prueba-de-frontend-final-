import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '@/context/AuthContext';
import { describe, it, expect } from 'vitest';

describe('LoginPage', () => {
    it('renderiza correctamente el formulario de login y evalúa sus elementos (Integration Test)', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        );

        // Verify standard inputs exist without triggering state mutations yet
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
        expect(screen.getByText(/Bienvenida a Dani Events/i)).toBeInTheDocument();
    });
});
