interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "OR CONTINUE WITH" }: AuthDividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-500">{label}</span>
      </div>
    </div>
  );
}
