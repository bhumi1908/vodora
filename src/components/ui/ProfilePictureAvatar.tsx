type ProfilePictureAvatarProps = {
  name: string;
  initials: string;
  profilePictureUrl?: string | null;
  containerClassName?: string;
  initialsClassName?: string;
};

export function ProfilePictureAvatar({
  name,
  initials,
  profilePictureUrl,
  containerClassName = "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100",
  initialsClassName = "font-semibold text-blue-700",
}: ProfilePictureAvatarProps) {
  const photoUrl = profilePictureUrl?.trim() || null;

  return (
    <div className={containerClassName}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={initialsClassName}>{initials}</span>
      )}
    </div>
  );
}
