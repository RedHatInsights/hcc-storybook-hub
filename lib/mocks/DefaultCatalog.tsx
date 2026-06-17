import React from 'react';

const defaultTutorials = [
  { id: 'getting-started', title: 'Getting Started', description: 'Learn the basics.', time: '10 min', level: 'Beginner' },
  { id: 'custom-roles', title: 'Creating Custom Roles', description: 'Configure custom roles.', time: '15 min', level: 'Intermediate' },
  { id: 'user-groups', title: 'Managing User Groups', description: 'Organize users into groups.', time: '12 min', level: 'Beginner' },
  { id: 'workspaces', title: 'Workspace Administration', description: 'Master workspace management.', time: '20 min', level: 'Advanced' },
];

export const DefaultCatalog: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 300 }}>Quick starts</h2>
    <p style={{ color: '#6a6e73', margin: '0 0 24px', fontSize: '14px' }}>
      Step-by-step instructions and guided tours.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {defaultTutorials.map((t) => (
        <div key={t.id} style={{ border: '1px solid #d2d2d2', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>{t.title}</h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#6a6e73' }}>{t.description}</p>
        </div>
      ))}
    </div>
  </div>
);
