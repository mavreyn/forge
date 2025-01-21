import type { HTMLAttributes } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@forge/ui";

import WaveReveal from "./wave-reveal";

interface ImageProps extends HTMLAttributes<HTMLDivElement> {
  item: { image: string; title: string };
  index: number;
  activeItem: number;
}

interface ExpandableProps {
  list?: { image: string; title: string }[];
  autoPlay?: boolean;
  className?: string;
}

const List = ({ item, className, index, activeItem, ...props }: ImageProps) => {
  return (
    <div
      className={cn(
        "relative flex h-40 w-full cursor-pointer overflow-hidden rounded-md transition-all delay-0 duration-300 ease-in-out md:h-full md:w-20",
        {
          "flex-grow": index === activeItem,
        },
        className,
      )}
      {...props}
    >
      <Image
        src={item.image}
        alt={item.title}
        height={0}
        width={0}
        className={cn("h-full w-full object-cover", {
          "blur-[2px]": index !== activeItem,
        })}
      />
      {index === activeItem && (
        <div className="absolute bottom-2 left-2 text-xs text-white sm:bottom-4 sm:left-4 md:text-lg">
          <WaveReveal
            duration="1000ms"
            className="font-pragati mb-2 items-end justify-end text-[30px] font-bold leading-[102px] tracking-[0.05em] text-white [text-shadow:0px_0px_281.064px_#6B21A8,0px_0px_160.608px_#6B21A8,0px_0px_93.688px_#6B21A8,0px_0px_46.844px_#6B21A8,0px_0px_13.384px_#6B21A8,0px_0px_6.692px_#6B21A8] md:items-start md:justify-start md:text-center md:text-[60px]"
            text={item.title}
            direction="up"
          />
        </div>
      )}
    </div>
  );
};

const items = [
  {
    image: "/hackathon.jpg",
    title: "Hackathons",
  },
  {
    image: "/workshop.jpg",
    title: "Workshops",
  },
  {
    image: "/members.jpg",
    title: "Leadership",
  },
];

export default function Expandable({
  list = items,
  autoPlay = true,
  className,
}: ExpandableProps) {
  const [activeItem, setActiveItem] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const interval = setInterval(() => {
      if (!isHovering) {
        setActiveItem((prev) => (prev + 1) % list.length);
      }
    }, 6000); // Slower autoplay for better mobile UX

    return () => clearInterval(interval);
  }, [autoPlay, list.length, isHovering]);

  return (
    <div
      className={cn(
        "flex h-auto w-full flex-col items-center gap-2 md:h-96 md:flex-row",
        className,
      )}
    >
      {list.map((item, index) => (
        <List
          key={item.title}
          item={item}
          index={index}
          activeItem={activeItem}
          onMouseEnter={() => {
            setActiveItem(index);
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
        />
      ))}
    </div>
  );
}
