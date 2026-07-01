type ConnectionAvatarProps = {
  name: string;
  initials: string;
  profilePictureUrl?: string | null;
  size?: "md" | "lg";
  className?: string;
};

const sizeClasses = {
  md: "h-14 w-14 text-lg",
  lg: "h-16 w-16 text-lg",
};

export function ConnectionAvatar({
  name,
  initials,
  profilePictureUrl,
  size = "md",
  className = "",
}: ConnectionAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 ${sizeClasses[size]} ${className}`}
    >
      {profilePictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePictureUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold text-blue-700">{initials}</span>
      )}
    </div>
  );
}
