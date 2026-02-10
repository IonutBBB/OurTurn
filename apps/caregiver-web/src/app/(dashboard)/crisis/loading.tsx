export default function CrisisLoading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 bg-surface-border rounded-lg w-1/3" />
      <div className="h-64 bg-surface-border rounded-xl" />
      <div className="h-32 bg-surface-border rounded-xl" />
    </div>
  );
}
