import Image from "next/image";

interface AboutImageCardProps {
  readonly image: string;
  readonly title: string;
  readonly description: string;
}

export function AboutImageCard({ image, title, description }: AboutImageCardProps) {
  return (
    <div className="flex flex-col sm:w-[450px]">
      <div className="relative w-full overflow-hidden rounded-2xl sm:w-[450px]">
        <Image
          src={image}
          alt={title}
          width={450}
          height={520}
          className="h-auto w-full sm:w-[450px] object-cover"
        />
      </div>
      <div className="mt-6">
        <h3 className="text-2xl sm:text-3xl text-black">{title}</h3>
        <p className="mt-2 text-base sm:text-lg leading-relaxed text-black">{description}</p>
      </div>
    </div>
  );
}
