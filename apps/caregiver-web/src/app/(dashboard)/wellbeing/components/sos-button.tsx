'use client';

import { useState } from 'react';
import { SosModal } from './sos-modal';

interface SosButtonProps {
  caregiverId: string;
  householdId: string;
  patientId: string;
}

export function SosButton({ caregiverId, householdId, patientId }: SosButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-status-danger text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-status-danger/30"
        aria-label="SOS - Get immediate help"
      >
        <span className="text-xl font-bold">SOS</span>
      </button>

      {showModal && (
        <SosModal
          caregiverId={caregiverId}
          householdId={householdId}
          patientId={patientId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
