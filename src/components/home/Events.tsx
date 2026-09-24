import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { DEFAULT_EVENTS, type EventItem } from '../../data/events.ts'

interface EventsProps {
  events?: EventItem[]
}

export default function Events({
  events = DEFAULT_EVENTS,
}: EventsProps) {
  const sectionId = useId()
  const sectionRef = useRef<HTMLElement>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const isHorizontalDrag = useRef<boolean | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalEvents = events.length
  const activeEventIndex = ((currentIndex % totalEvents) + totalEvents) % totalEvents

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => prev - 1)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const handleSlideClick = useCallback((targetIndex: number) => {
    setCurrentIndex(targetIndex)
  }, [])

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement

      if (isInput) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  // Mouse & Touch Drag handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStartX.current = clientX
    dragStartY.current = clientY
    isHorizontalDrag.current = null
    setDragOffset(0)
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return

    const deltaX = clientX - dragStartX.current
    const deltaY = clientY - dragStartY.current

    if (isHorizontalDrag.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalDrag.current = Math.abs(deltaX) >= Math.abs(deltaY)
      }
    }

    if (isHorizontalDrag.current) {
      setDragOffset(deltaX)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 60
    if (dragOffset < -threshold) {
      handleNext()
    } else if (dragOffset > threshold) {
      handlePrev()
    }
    setDragOffset(0)
    isHorizontalDrag.current = null
  }

  // Virtual slide indices to render: [currentIndex - 1, currentIndex, currentIndex + 1]
  const visibleSlots = [-1, 0, 1]

  return (
    <section
      ref={sectionRef}
      id="events"
      aria-labelledby={`${sectionId}-heading`}
      className="relative flex h-[calc(100svh-5.5rem)] min-h-[540px] max-h-[960px] w-full scroll-mt-16 flex-col justify-between select-none overflow-hidden py-2 sm:py-4"
    >
      {/* Header section matching reference image */}
      <div className="flex shrink-0 flex-col justify-between gap-2 px-2 pb-2 sm:flex-row sm:items-end sm:pb-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
            <span
              className="inline-block h-2 w-2 bg-medium-red"
              aria-hidden="true"
            />
            <span>Featured Experiences</span>
          </div>

          <h2
            id={`${sectionId}-heading`}
            className="font-heading text-3xl font-bold text-near-black underline underline-offset-8 decoration-medium-red sm:text-4xl md:text-5xl dark:text-mist"
          >
            EVENTS
          </h2>

          {/* <p className="mt-1 text-xs text-near-black/70 sm:text-sm md:text-base dark:text-mist/70">
            Discover what's happening next.
          </p> */}
        </div>

        {/* Top-right Counter & Navigation Controls */}
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div
            className="font-mono text-xs tracking-widest text-near-black/60 sm:text-sm dark:text-mist/60"
            aria-live="polite"
          >
            <span className="font-bold text-medium-red">
              {String(activeEventIndex + 1).padStart(2, '0')}
            </span>
            <span className="mx-1 text-near-black/30 dark:text-mist/30">//</span>
            <span>{String(totalEvents).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous event"
              className="flex h-9 w-9 items-center justify-center rounded-xs border border-dark-red/30 bg-near-black/5 text-near-black transition-all hover:border-medium-red hover:bg-medium-red/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-medium-red focus-visible:outline-none sm:h-10 sm:w-10 dark:border-mist/20 dark:bg-near-black/60 dark:text-mist dark:hover:border-medium-red dark:hover:bg-medium-red/20"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next event"
              className="flex h-9 w-9 items-center justify-center rounded-xs border border-dark-red/30 bg-near-black/5 text-near-black transition-all hover:border-medium-red hover:bg-medium-red/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-medium-red focus-visible:outline-none sm:h-10 sm:w-10 dark:border-mist/20 dark:bg-near-black/60 dark:text-mist dark:hover:border-medium-red dark:hover:bg-medium-red/20"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Viewport Container */}
      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Arcane Events Carousel"
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) =>
          e.touches[0] &&
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          e.touches[0] &&
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={handleDragEnd}
        className="relative flex flex-1 items-center justify-center w-full cursor-grab active:cursor-grabbing touch-pan-y overflow-visible min-h-0"
      >
        {/* Carousel Stage - fills available viewport height */}
        <div className="relative mx-auto flex h-full max-h-[62vh] min-h-[360px] w-full items-center justify-center">
          {visibleSlots.map((slotOffset) => {
            const slotIndex = currentIndex + slotOffset
            const eventIndex =
              ((slotIndex % totalEvents) + totalEvents) % totalEvents
            const item = events[eventIndex]
            const isCenter = slotOffset === 0

            // Spacing & offset calculation
            // Center slide is at 0px offset. Left slide is at -75%, Right slide is at +75%
            const slideStepPercent = 75
            const baseOffsetPercent = slotOffset * slideStepPercent
            const dragOffsetPx = dragOffset

            return (
              <div
                key={`${slotIndex}-${item.id}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${item.title} (${eventIndex + 1} of ${totalEvents})`}
                aria-hidden={!isCenter}
                onClick={() => !isCenter && handleSlideClick(slotIndex)}
                style={{
                  transform: `translateX(calc(${baseOffsetPercent}% + ${dragOffsetPx}px)) scale(${
                    isCenter ? 1 : 0.92
                  })`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms ease, filter 600ms ease',
                  opacity: isCenter ? 1 : 0.55,
                  zIndex: isCenter ? 10 : 2,
                }}
                className={`absolute inset-y-0 flex w-[88%] sm:w-[80%] md:w-[72%] items-center justify-center transition-all ${
                  isCenter
                    ? 'pointer-events-auto'
                    : 'pointer-events-auto cursor-pointer hover:opacity-75'
                }`}
              >
                {/* Slide Poster Card */}
                <div className="group relative h-full w-full overflow-hidden rounded-xs border border-dark-red/30 bg-near-black shadow-2xl transition-all duration-300 hover:border-medium-red/60 dark:border-dark-red/40">
                  {/* Poster Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading={isCenter ? 'eager' : 'lazy'}
                    draggable={false}
                    className="h-full w-full object-cover object-center select-none transition-transform duration-700 group-hover:scale-[1.02]"
                  />

                  {/* Dark gradient overlay for crystal clear text readability */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-near-black via-near-black/70 to-transparent"
                  />

                  {/* Top-left Category Tag (if present) */}
                  {item.tag && (
                    <div className="absolute top-3 left-3 z-10 sm:top-5 sm:left-5">
                      <span className="rounded-xs border border-mist/20 bg-near-black/70 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-mist uppercase backdrop-blur-xs sm:text-xs">
                        {item.tag}
                      </span>
                    </div>
                  )}

                  {/* Bottom Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-end sm:p-6 md:p-8">
                    {/* Left: Event Title & Short Description */}
                    <div className="max-w-xl text-left">
                      <h3
                        className="font-heading text-lg font-bold text-mist sm:text-2xl md:text-3xl lg:text-4xl uppercase"
                      >
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-mist/85 sm:text-sm md:text-base line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Right: Register Button */}
                    <div className="shrink-0 self-start sm:self-end">
                      <Link
                        to={item.to}
                        tabIndex={isCenter ? 0 : -1}
                        className="group/btn inline-flex items-center gap-2 rounded-xs bg-medium-red px-5 py-2.5 text-xs font-bold tracking-wider text-mist uppercase transition-all duration-200 hover:bg-dark-red hover:shadow-[0_0_20px_rgba(170,52,48,0.5)] active:scale-95 focus-visible:ring-2 focus-visible:ring-mist focus-visible:outline-none sm:px-6 sm:py-3 sm:text-sm"
                      >
                        <span>REGISTER</span>
                        <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
