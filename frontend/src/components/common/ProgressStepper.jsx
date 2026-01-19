import React from 'react';
import './ProgressStepper.css';

const ProgressStepper = ({ currentStatus }) => {
    const statuses = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'HIRED'];

    // Normalize status for matching
    const normalizedStatus = (currentStatus || 'APPLIED').toUpperCase();

    // Handle REJECTED case specially
    const isRejected = normalizedStatus === 'REJECTED';

    const getStatusIndex = (status) => {
        if (isRejected) return 1; // Mark as rejected at the reviewing stage usually
        const index = statuses.indexOf(status);
        return index === -1 ? 0 : index;
    };

    const currentIndex = getStatusIndex(normalizedStatus);

    return (
        <div className="stepper-wrapper">
            {statuses.map((step, index) => (
                <div key={step} className={`step-item ${index <= currentIndex ? 'active' : ''} ${index === currentIndex && isRejected ? 'rejected' : ''} ${index === currentIndex ? 'current' : ''}`}>
                    <div className="step-counter">
                        {index < currentIndex ? '✓' : (index === currentIndex && isRejected ? '✕' : index + 1)}
                    </div>
                    <div className="step-name">{step.charAt(0) + step.slice(1).toLowerCase()}</div>
                    {index < statuses.length - 1 && <div className="step-line"></div>}
                </div>
            ))}
        </div>
    );
};

export default ProgressStepper;
