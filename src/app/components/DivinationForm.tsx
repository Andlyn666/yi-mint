 'use client';

interface DivinationFormProps {
  question: string;
  onQuestionChange: (question: string) => void;
}

export default function DivinationForm({ question, onQuestionChange }: DivinationFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement mint logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-lg mb-2">
          输入您的问题（选填）
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 text-white"
          rows={4}
          placeholder="Enter your question ..."
        />
      </div>
      
      <button
        type="submit"
        className="w-full py-3 px-6 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Divine & Mint NFT
      </button>
    </form>
  );
}