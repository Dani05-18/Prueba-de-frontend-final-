import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorMsg: ''
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorMsg: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Capture render error with details
        console.error('Error Boundary atrapó un error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: '#e11d48' }}>¡Vaya, ha ocurrido un error inesperado!</h1>
                    <p>Nuestra aplicación no pudo renderizar esta vista.</p>
                    <p style={{ margin: '1rem 0', fontWeight: 'bold' }}>Detalle del Fallo:</p>
                    <pre style={{ background: '#f8f8f8', padding: '1rem', display: 'inline-block' }}>
                        {this.state.errorMsg}
                    </pre>
                    <br />
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{ marginTop: '2rem', padding: '10px 20px', cursor: 'pointer', background: '#e11d48', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Volver al inicio (Recuperación)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
