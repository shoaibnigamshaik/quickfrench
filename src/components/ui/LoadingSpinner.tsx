interface LoadingSpinnerProps {
    message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="text-center">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                    style={{ borderColor: 'var(--primary-600)' }}
                ></div>
                <p style={{ color: 'var(--muted-foreground)' }}>{message}</p>
            </div>
        </div>
    );
}
