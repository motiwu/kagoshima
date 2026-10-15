'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from 'cn'

type Props = {
  href: string
  label: string
  direction: 'back' | 'forward'
  /** 首頁的 Hero 佔滿整個畫面，滑過大半才出現，不要壓在封面上 */
  afterHero?: boolean
}

/** 浮在右下角，滑到哪裡都按得到；比地點抽屜（z-50）低，抽屜打開時會被蓋住 */
export function FloatingLink({ href, label, direction, afterHero = false }: Props) {
  const [shown, setShown] = useState(!afterHero)

  useEffect(() => {
    if (!afterHero) return
    const update = () => setShown(window.scrollY > window.innerHeight * 0.6)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [afterHero])

  const Arrow = direction === 'back' ? ArrowLeft : ArrowRight
  return (
    <Link
      href={href}
      tabIndex={shown ? undefined : -1}
      aria-hidden={shown ? undefined : true}
      className={cn(
        'fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex items-center gap-1.5 rounded-full bg-navy py-2.5 font-serif text-[16px] tracking-[0.15em] text-white shadow-lg shadow-navy/25 transition-[opacity,translate] duration-300',
        direction === 'back' ? 'pr-5 pl-4' : 'pr-4 pl-5',
        !shown && 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      {direction === 'back' && <Arrow className="size-[18px]" strokeWidth={1.5} aria-hidden />}
      {label}
      {direction === 'forward' && <Arrow className="size-[18px]" strokeWidth={1.5} aria-hidden />}
    </Link>
  )
}
