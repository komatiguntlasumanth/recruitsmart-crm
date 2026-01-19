import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: '#ef4444' }}>Something went wrong.</h1>
                    <p>The application crashed. Please share this error with the developer:</p>
                    <div style={{
                        background: '#f1f5f9',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginTop: '1rem',
                        textAlign: 'left',
                        overflow: 'auto',
                        maxHeight: '400px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <pre style={{ color: '#dc2626', fontWeight: 'bold' }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <br />
                        <pre style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
