import React, { useEffect, useState } from 'react';

interface DebugAnimationsProps {
  gameState: any;
}

export const DebugAnimations: React.FC<DebugAnimationsProps> = ({ gameState }) => {
  const [debugInfo, setDebugInfo] = useState({
    lastEvent: null as any,
    animationState: 'idle',
    movementQueue: [] as string[],
    attackQueue: [] as string[]
  });

  useEffect(() => {
    const lastEvent = gameState.eventLog[gameState.eventLog.length - 1];
    if (lastEvent) {
      setDebugInfo(prev => ({
        ...prev,
        lastEvent,
        animationState: lastEvent.type === 'move' ? 'moving' : 
                         lastEvent.type === 'attack' ? 'attacking' : 'idle'
      }));
    }
  }, [gameState.eventLog]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <div><strong>Animation Debug</strong></div>
      <div>State: {debugInfo.animationState}</div>
      <div>Last Event: {debugInfo.lastEvent?.type || 'none'}</div>
      {debugInfo.lastEvent?.type === 'move' && (
        <div>Move: {debugInfo.lastEvent.from.x},{debugInfo.lastEvent.from.y} → {debugInfo.lastEvent.to.x},{debugInfo.lastEvent.to.y}</div>
      )}
      {debugInfo.lastEvent?.type === 'attack' && (
        <div>Attack: {debugInfo.lastEvent.attackerId} → {debugInfo.lastEvent.targetId} ({debugInfo.lastEvent.outcome})</div>
      )}
    </div>
  );
};

export default DebugAnimations;