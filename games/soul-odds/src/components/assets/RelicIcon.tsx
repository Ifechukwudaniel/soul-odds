import Image from "next/image";

const RELICS = {
  mask: {
    src: "/egypt/Relics/sand_relics_golden_mask_01.png",
    alt: "Golden burial mask",
  },
  chest: {
    src: "/egypt/Relics/sand_relics_treasure_chest_gold_01.png",
    alt: "Gilded treasure chest",
  },
  sarcophagus: {
    src: "/egypt/Relics/sand_relics_sarcophagus_open_01.png",
    alt: "Open sarcophagus",
  },
  obelisk: {
    src: "/egypt/Monuments/sand_monuments_obelisk_01.png",
    alt: "Obelisk",
  },
  pyramid: {
    src: "/egypt/Monuments/sand_monuments_great_pyramid_01.png",
    alt: "Great pyramid",
  },
  sphinx: {
    src: "/egypt/Monuments/sand_monuments_sphinx_statue_01.png",
    alt: "Sphinx statue",
  },
  scarab: {
    src: "/egypt/Architecture/sand_architecture_floor_hieroglyph_carved_01.png",
    alt: "Carved hieroglyphs",
  },
  papyrus: {
    src: "/egypt/Flora/sand_flora_papyrus_reed_cluster_01.png",
    alt: "Papyrus reeds",
  },
  dune: {
    src: "/egypt/Bg/SandMountains_Bg.png",
    alt: "Sand dune",
  },
} as const;

export type RelicName = keyof typeof RELICS;

export const RelicIcon = ({
  relic: relicName,
  size = 40,
  className,
}: {
  relic: RelicName;
  size?: number;
  className?: string;
}) => {
  const relic = RELICS[relicName];

  return (
    <div
      className={`relative shrink-0 ${className ?? ""}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={relic.src}
        alt={relic.alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};