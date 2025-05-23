'use client';

interface InterpretationDisplayProps {
  interpretation: string | null;
}

export default function InterpretationDisplay({ interpretation }: InterpretationDisplayProps) {
  if (!interpretation) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Unscramble</h2>
      <div className="bg-gray-800 p-6 rounded-lg">
        {interpretation.split('\n').map((line, index) => (
          <p key={index} className={`${index === 0 ? 'text-xl font-semibold' : 'mt-3'}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}