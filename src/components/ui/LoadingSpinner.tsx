export default function LoadingSpinner({ size = 'md' }: { size?: 'md' | 'lg' }) {
    return (
        <div className="loading-center">
            <div className={`spinner ${size === 'lg' ? 'spinner--lg' : ''}`} />
        </div>
    );
}
