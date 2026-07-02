interface StatCardProps {
  readonly value: string;
  readonly label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div>
      <p className="text-3xl text-gray-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm ">{label}</p>
    </div>
  );
}
