import SponsorCard from "./sponsors-assets/sponsor-card";

const companies = [
  {
    name: "BNY MELLON",
    logo: "/logos/bny-mellon.svg",
  },
  {
    name: "EA",
    logo: "/logos/ea.svg",
  },
  {
    name: "Facebook",
    logo: "/logos/facebook.svg",
  },
  {
    name: "Geico",
    logo: "/logos/geico.svg",
  },
  {
    name: "Google-Cloud",
    logo: "/logos/google-cloud.svg",
  },
  {
    name: "IBM",
    logo: "/logos/ibm.svg",
  },
  {
    name: "Lockheed Martin",
    logo: "/logos/lockheed-martin.svg",
  },
  {
    name: "Microsoft",
    logo: "/logos/microsoft.svg",
  },
  {
    name: "Synopsys",
    logo: "/logos/synopsys.svg",
  },
];

export default function Sponsors() {
  return (
    <div className="my-5 flex min-h-screen flex-col justify-center">
      <p className="font-pragati mb-2 text-center text-[25px] font-bold leading-[102px] tracking-[0.05em] text-white [text-shadow:0px_0px_281.064px_#6B21A8,0px_0px_160.608px_#6B21A8,0px_0px_93.688px_#6B21A8,0px_0px_46.844px_#6B21A8,0px_0px_13.384px_#6B21A8,0px_0px_6.692px_#6B21A8] md:text-[50px]">
        {" "}
        Trusted by top companies{" "}
      </p>
      <div className="flex flex-wrap justify-center gap-5">
        {companies.map((sponsor) => (
          <SponsorCard sponsor={sponsor.name} imgUrl={sponsor.logo} />
        ))}
      </div>
    </div>
  );
}
