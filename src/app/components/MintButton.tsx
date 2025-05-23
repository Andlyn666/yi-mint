'use client';

interface MintButtonProps {
  onMint: () => void;
  disabled?: boolean;
}

export default function MintButton({ onMint, disabled = false }: MintButtonProps) {
  return (
    <button
      onClick={onMint}
      disabled={disabled}
      className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-opacity ${
        disabled 
          ? 'bg-gray-600 cursor-not-allowed' 
          : 'bg-gradient-to-r from-yellow-600 to-red-600 hover:opacity-90'
      }`}
    >
       Divine & Mint NFT
    </button>
  );
}