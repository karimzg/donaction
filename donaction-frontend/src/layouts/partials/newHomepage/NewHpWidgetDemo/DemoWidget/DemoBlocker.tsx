'use client';

import Link from 'next/link';
import { DemoBlockerProps } from '../types';

function LockIcon() {
  return (
    <svg
      className="w-16 h-16 text-[#fb9289]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

export default function DemoBlocker({ onClose }: DemoBlockerProps) {
  return (
    <div
      className="demo-blocker fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="demo-blocker__card bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          <div className="bg-[#fb9289]/10 p-4 rounded-full">
            <LockIcon />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Mode Démonstration
        </h3>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Cette interface est une démonstration. Pour effectuer un don réel et
          soutenir une association, découvrez nos projets partenaires.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
          <Link
            href="/projets"
            className="px-6 py-3 bg-[#73cfa8] text-white rounded-lg font-semibold hover:bg-[#5bb892] transition-colors"
          >
            Voir les projets
          </Link>
        </div>
      </div>
    </div>
  );
}
