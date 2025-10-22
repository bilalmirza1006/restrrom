// components/global/DebugComponent.js
'use client';
import { useEffect } from 'react';

export const DebugComponent = ({ children, name }) => {
  useEffect(() => {
    console.log(`🔄 Rendering component: ${name}`);
  }, [name]);

  if (!children) {
    console.error(`❌ Component ${name} is undefined or null`);
    return <div>Error: Component {name} is not properly defined</div>;
  }

  return children;
};

export default DebugComponent;
