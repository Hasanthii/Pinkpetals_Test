import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center" style={{ background: '#fffaf9' }}>
                    <div className="text-center max-w-md mx-auto px-6">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: '#fdeef0' }}
                        >
                            <AlertTriangle size={28} className="text-[#B76E79]" />
                        </div>
                        <h2
                            className="text-xl font-semibold text-[#3d1a22] mb-3"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Something went wrong
                        </h2>
                        <p
                            className="text-sm text-gray-500 mb-6 leading-relaxed"
                            style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                            We encountered an unexpected error. Please try reloading the page.
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 text-white text-sm font-medium px-8 py-3 rounded-full transition-all duration-300 hover:shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)',
                                fontFamily: 'Jost, sans-serif',
                                boxShadow: '0 8px 24px rgba(183,110,121,0.40)',
                            }}
                        >
                            <RefreshCw size={15} />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
