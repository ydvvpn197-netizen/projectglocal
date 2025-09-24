import React from 'react';
import { createRoot } from 'react-dom/client';

function AdminApp(): React.JSX.Element {
  return <div>Glocal Admin</div>;
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AdminApp />);
}

export default AdminApp;



