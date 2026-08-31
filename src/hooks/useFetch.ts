import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import apiClient from '@/api/client';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * Genérico reutilizable (hook `useFetch<T>`) disparado desde un useEffect,
 * con try/catch/finally distinguiendo error de red, de validación y de autorización.
 */
export function useFetch<T>(url: string) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                // Fetch logic
                const response = await apiClient.get<T>(url);
                if (isMounted) {
                    setState({ data: response.data, loading: false, error: null });
                }
            } catch (err) {
                if (isMounted) {
                    let errorMessage = 'Ocurrió un error en la solicitud.';

                    if (axios.isAxiosError(err)) {
                        const error: AxiosError = err;
                        if (!error.response) {
                            errorMessage = 'Error de red. Verifica tu estado de conexión a internet o el backend.';
                        } else if (error.response.status === 400 || error.response.status === 422) {
                            errorMessage = 'Error de validación (400). Los parámetros o el cuerpo de la petición son incorrectos.';
                        } else if (error.response.status === 401 || error.response.status === 403) {
                            errorMessage = 'Error de autorización (401/403). No tienes permisos para acceder a este recurso.';
                        } else {
                            errorMessage = `Fallo del API. Status HTTP: ${error.response.status}`;
                        }
                    }

                    setState({ data: null, loading: false, error: errorMessage });
                }
            } finally {
                // finally block completion logging
                if (isMounted) {
                    console.log(`[useFetch] Terminated request to ${url}`);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [url]);

    return state;
}
