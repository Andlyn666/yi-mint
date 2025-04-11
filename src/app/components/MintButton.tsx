'use client';

interface MintButtonProps {
  onMint: () => void;
}

export default function MintButton({ onMint }: MintButtonProps) {
  return (
    <button
      onClick={onMint}
      className="w-full py-3 px-6 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
    >
      Mint & Augur
    </button>
  );
}