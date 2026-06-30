type ConnectModalAvatarProps = {
  name: string;
  profilePictureUrl: string | null;
  initials: string;
  size?: "md" | "sm";
};

const sizeClasses = {
  md: {
    container: "h-14 w-14 rounded-2xl",
    initials: "text-xl",
  },
  sm: {
    container: "h-12 w-12 rounded-2xl sm:h-14 sm:w-14",
    initials: "text-lg sm:text-xl",
  },
};

export function ConnectModalAvatar({
  name,
  profilePictureUrl,
  initials,
  size = "md",
}: ConnectModalAvatarProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-blue-100 ${classes.container}`}
    >
      {profilePictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePictureUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={`font-bold text-blue-700 ${classes.initials}`}>
          {initials}
        </span>
      )}
    </div>
  );
}
