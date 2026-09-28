import { motion } from 'framer-motion'

interface Shot {
  src: string
  alt: string
  frame: string
  img: string
}

// Arcane 2.0 archive shots — deliberately uneven spans, offsets and tilts.
const SHOTS: Shot[] = [
  {
    src: '/collage/img1.jpeg',
    alt: 'Arcane 2.0 crowd during the main stage keynote',
    frame: 'col-span-12 -rotate-1 sm:col-span-3 sm:rotate-[-1deg]',
    img: 'aspect-[16/10] sm:aspect-square',
  },
  {
    src: '/collage/img2.jpeg',
    alt: 'Arcane 2.0 participants collaborating in the arena',
    frame: 'col-span-12 rotate-1 sm:col-span-3 sm:rotate-[1deg]',
    img: 'aspect-[16/9] sm:aspect-square',
  },
  {
    src: '/collage/img5.jpeg',
    alt: 'Arcane 2.0 workshop session in progress',
    frame: 'col-span-12 -rotate-1 sm:col-span-3 sm:rotate-[-1deg]',
    img: 'aspect-[4/3] sm:aspect-square',
  },
  {
    src: '/collage/img4.jpeg',
    alt: 'Arcane 2.0 stage moment with the audience',
    frame: 'col-span-12 rotate-1 sm:col-span-3 sm:rotate-[1deg]',
    img: 'aspect-[16/10] sm:aspect-square',
  },
]

/**
 * Asymmetric Arcane 2.0 archive collage at half size, kept barely
 * visible (dimmed to a whisper) over the soil.
 */
export default function FlashCollage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
      className="mt-12 sm:mt-16"
    >
      <div className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
        <span>// Arcane 2.0 Archives</span>
      </div>

      <div className="mx-auto grid w-full grid-cols-12 gap-4 sm:gap-5">
        {SHOTS.map((shot) => (
          <figure
            key={shot.src}
            className={`overflow-hidden rounded-xl border border-dark-red/30 bg-near-black/80 ${shot.frame}`}
          >
            <img
              src={shot.src}
              alt={shot.alt}
              loading="lazy"
              draggable={false}
              className={`h-full w-full object-cover ${shot.img}`}
            />
          </figure>
        ))}
      </div>
    </motion.div>
  )
}
