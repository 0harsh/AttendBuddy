export default function LoadingSpinner() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">📚</div>
        <p className="text-white text-lg">Loading attendance...</p>
      </div>
    </div>
  );
}
