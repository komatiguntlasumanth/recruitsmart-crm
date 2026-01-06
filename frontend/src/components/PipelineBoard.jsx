import React, { useState } from 'react';

const PipelineBoard = () => {
    const [opportunities, setOpportunities] = useState([
        { id: 1, title: 'Summer Internship Drive', value: 5000, stage: 'Prospecting', customer: 'Google' },
        { id: 2, title: 'Mid-Senior Java Devs', value: 12000, stage: 'Negotiation', customer: 'Meta' },
        { id: 3, title: 'Campus Recruitment 2026', value: 25000, stage: 'Closed Won', customer: 'TCS' },
        { id: 4, title: 'AI Research Grant', value: 8000, stage: 'Negotiation', customer: 'OpenAI' },
    ]);

    const stages = ['Prospecting', 'Negotiation', 'Closed Won', 'Closed Lost'];

    const getStageColor = (stage) => {
        switch (stage) {
            case 'Closed Won': return '#10b981';
            case 'Closed Lost': return '#ef4444';
            default: return 'var(--primary)';
        }
    };

    return (
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {stages.map(stage => (
                <div key={stage} style={{ minWidth: '300px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{stage}</h3>
                        <span style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)'
                        }}>
                            {opportunities.filter(o => o.stage === stage).length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {opportunities.filter(o => o.stage === stage).map(opp => (
                            <div key={opp.id} className="glass-card" style={{ padding: '1.2rem', cursor: 'grab' }}>
                                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{opp.title}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opp.customer}</span>
                                    <span style={{ fontWeight: '700', color: getStageColor(stage) }}>${opp.value.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PipelineBoard;
