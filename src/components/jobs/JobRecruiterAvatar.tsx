import type { JobRecruiter } from "@/lib/jobs/candidate-jobs.types";

type JobRecruiterAvatarProps = {
  recruiter: JobRecruiter;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: {
    container: "h-14 w-14 rounded-2xl",
    initials: "text-xl",
  },
  lg: {
    container: "h-16 w-16 rounded-2xl",
    initials: "text-2xl",
  },
};

export function JobRecruiterAvatar({
  recruiter,
  size = "md",
}: JobRecruiterAvatarProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-blue-100 ${classes.container}`}
    >
      {recruiter.profilePictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recruiter.profilePictureUrl}
          alt={recruiter.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={`font-bold text-blue-700 ${classes.initials}`}>
          {recruiter.avatar}
        </span>
      )}
    </div>
  );
}
