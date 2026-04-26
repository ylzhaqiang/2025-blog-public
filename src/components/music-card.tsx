'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight, ListMusic } from 'lucide-react'

type MusicItem = { name: string; file: string }

export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const [musicList, setMusicList] = useState<MusicItem[]>([])
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const [showList, setShowList] = useState(false)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const shouldPlayRef = useRef(false)
	const currentIndexRef = useRef(0)

	const isHomePage = pathname === '/'

	// Fetch music list
	useEffect(() => {
		fetch('/api/music')
			.then(r => r.json())
			.then(data => {
				if (Array.isArray(data) && data.length > 0) {
					setMusicList(data)
				}
			})
			.catch(console.error)
	}, [])

	const position = useMemo(() => {
		if (!isHomePage) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - styles.height - 16
			}
		}
		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	const { x, y } = position

	// Initialize audio element once
	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio()
		}
		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
			}
		}

		const handleEnded = () => {
			if (musicList.length === 0) return
			const next = (currentIndexRef.current + 1) % musicList.length
			currentIndexRef.current = next
			setCurrentIndex(next)
			setProgress(0)
			shouldPlayRef.current = true
			// 直接播放下一首
			audio.src = musicList[next].file
			audio.play().catch(console.error)
		}

		audio.addEventListener('timeupdate', updateProgress)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('loadedmetadata', updateProgress)

		return () => {
			audio.removeEventListener('timeupdate', updateProgress)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('loadedmetadata', updateProgress)
		}
	}, [musicList.length, musicList])

	// Load track when currentIndex changes
	useEffect(() => {
		if (musicList.length === 0) return
		currentIndexRef.current = currentIndex
		if (!audioRef.current) return

		const audio = audioRef.current
		audio.pause()
		audio.src = musicList[currentIndex].file
		audio.loop = false
		setProgress(0)

		if (shouldPlayRef.current) {
			shouldPlayRef.current = false
			audio.play().catch(console.error)
			setIsPlaying(true)
		}
	}, [currentIndex, musicList])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.src = ''
			}
		}
	}, [])

	const togglePlayPause = useCallback(() => {
		if (musicList.length === 0) return
		if (!audioRef.current || !audioRef.current.src) {
			// 还没选过歌，先选第一首
			setCurrentIndex(0)
			shouldPlayRef.current = true
			setIsPlaying(true)
			return
		}
		setIsPlaying(p => {
			const next = !p
			if (next) {
				audioRef.current?.play().catch(console.error)
			} else {
				audioRef.current?.pause()
			}
			return next
		})
	}, [musicList.length])

	const goNext = useCallback(() => {
		if (musicList.length === 0) return
		const next = (currentIndexRef.current + 1) % musicList.length
		currentIndexRef.current = next
		setCurrentIndex(next)
		shouldPlayRef.current = isPlaying
	}, [musicList.length, isPlaying])

	const goPrev = useCallback(() => {
		if (musicList.length === 0) return
		const prev = (currentIndexRef.current - 1 + musicList.length) % musicList.length
		currentIndexRef.current = prev
		setCurrentIndex(prev)
		shouldPlayRef.current = isPlaying
	}, [musicList.length, isPlaying])

	const selectTrack = useCallback((index: number) => {
		currentIndexRef.current = index
		setCurrentIndex(index)
		shouldPlayRef.current = true
		setIsPlaying(true)
		setShowList(false)
	}, [])

	if (!isHomePage && !isPlaying) return null

	const currentSong = musicList[currentIndex]

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className={clsx('flex items-center gap-2', !isHomePage && 'fixed')}>
				{siteContent.enableChristmas && (
					<>
						<img src='/images/christmas/snow-10.webp' alt='' className='pointer-events-none absolute' style={{ width: 120, left: -8, top: -12, opacity: 0.8 }} />
						<img src='/images/christmas/snow-11.webp' alt='' className='pointer-events-none absolute' style={{ width: 80, right: -10, top: -12, opacity: 0.8 }} />
					</>
				)}

				<MusicSVG className='h-7 w-7 shrink-0' />

				<div className='flex flex-1 flex-col gap-1 overflow-hidden'>
					{musicList.length === 0 ? (
						<div className='text-secondary text-xs'>暂无音乐</div>
					) : (
						<>
							<div className='text-secondary truncate text-sm'>{currentSong?.name || '未知'}</div>
							<div className='h-1.5 rounded-full bg-white/60'>
								<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
							</div>
						</>
					)}
				</div>

				<div className='flex shrink-0 items-center gap-1'>
					<button onClick={goPrev} className='flex h-8 w-8 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
						<ChevronLeft className='text-brand h-4 w-4' />
					</button>
					<button onClick={togglePlayPause} disabled={musicList.length === 0} className='flex h-8 w-8 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80 disabled:opacity-40'>
						{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-0.5 h-4 w-4' />}
					</button>
					<button onClick={goNext} className='flex h-8 w-8 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
						<ChevronRight className='text-brand h-4 w-4' />
					</button>
					<button onClick={() => setShowList(v => !v)} className='flex h-8 w-8 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
						<ListMusic className={clsx('text-brand h-4 w-4', showList && 'opacity-60')} />
					</button>
				</div>

				{showList && musicList.length > 0 && (
					<div className='absolute bottom-full right-0 mb-2 w-52 rounded-xl border bg-white/95 p-2 shadow-lg backdrop-blur' style={{ maxHeight: 200, overflowY: 'auto' }}>
						{musicList.map((item, i) => (
							<button
								key={item.file}
								onClick={() => selectTrack(i)}
								className={clsx(
									'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
									i === currentIndex ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'
								)}>
								{i === currentIndex && <Pause className='h-3 w-3 shrink-0' />}
								<span className='truncate'>{item.name}</span>
							</button>
						))}
					</div>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
