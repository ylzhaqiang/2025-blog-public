'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@/components/card'
import { useConfigStore } from './stores/config-store'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

interface FeedItem {
	title: string
	link: string
	pubDate: string
	author?: string
	content?: string
}

interface Feed {
	url: string
	title: string
	items: FeedItem[]
	loading: boolean
	error?: string
}

const RSS_PARSER_URL = 'https://api.rss2json.com/v1/api.json?rss_url='

async function fetchFeed(url: string): Promise<{ status: string; feed?: { title: string }; items: FeedItem[] }> {
	const res = await fetch(`${RSS_PARSER_URL}${encodeURIComponent(url)}`)
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	return res.json()
}

export default function RssReader() {
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.rssReader
	const hiCardStyles = cardStyles.hiCard
	const show = cardStyles.rssReader?.enabled !== false
	const center = useCenterStore()

	const [feeds, setFeeds] = useState<Feed[]>([])
	const [currentFeedIndex, setCurrentFeedIndex] = useState(0)
	const fetchFeedRef = useRef<Record<number, boolean>>({})

	const x = styles?.offsetX !== null ? center.x + styles.offsetX : center.x - hiCardStyles.width / 2 - (styles?.width || 360) - CARD_SPACING
	const y = styles?.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING

	const currentFeed = feeds[currentFeedIndex]

	// Initialize feeds from config
	useEffect(() => {
		if (!siteContent.rssFeeds || siteContent.rssFeeds.length === 0) return
		setFeeds(siteContent.rssFeeds.map((f: { url: string; title: string }) => ({ url: f.url, title: f.title, items: [], loading: true })))
	}, [siteContent.rssFeeds])

	// Fetch all feeds on mount
	useEffect(() => {
		if (feeds.length === 0) return
		feeds.forEach((_, index) => {
			if (fetchFeedRef.current[index]) return
			fetchFeedRef.current[index] = true
			fetchFeed(feeds[index].url).then(data => {
				setFeeds(prev => prev.map((f, i) => i === index ? {
					...f,
					title: f.title,
					items: data.items || [],
					loading: false
				} : f))
			}).catch(() => {
				setFeeds(prev => prev.map((f, i) => i === index ? { ...f, loading: false, error: '加载失败' } : f))
			}).finally(() => {
				fetchFeedRef.current[index] = false
			})
		})
	}, [feeds.length])

	const displayItems = currentFeed?.items.slice(0, 10) || []

	if (!show || styles?.enabled === false) return null

	return (
		<HomeDraggableLayer cardKey='rssReader' x={x} y={y} width={styles?.width || 360} height={styles?.height || 400}>
			<Card
				order={styles?.order || 9}
				width={styles?.width || 360}
				height={styles?.height || 400}
				x={x}
				y={y}
			>
				{siteContent.enableChristmas && (
					<>
						<img src='/images/christmas/snow-5.webp' alt='Christmas decoration' className='pointer-events-none absolute' style={{ width: 60, left: 2, bottom: 2, opacity: 0.6 }} />
						<img src='/images/christmas/snow-6.webp' alt='Christmas decoration' className='pointer-events-none absolute' style={{ width: 80, right: -4, top: -10, opacity: 0.6 }} />
					</>
				)}
				<div className='flex h-full flex-col p-4 pt-2'>
					{/* Header */}
					<div className='mb-2 flex items-center justify-between'>
						<h3 className='text-lg font-bold text-primary'>
							{currentFeed?.title || 'RSS 阅读器'}
						</h3>
						<div className='flex gap-1'>
							{feeds.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentFeedIndex(index)}
									className={`h-2 w-2 rounded-full transition-colors ${
										index === currentFeedIndex ? 'bg-brand' : 'bg-white/40'
									}`}
								/>
							))}
						</div>
					</div>

					{/* Content */}
					<div className='min-h-0 flex-1 overflow-y-auto'>
						{currentFeed?.loading ? (
							<div className='flex h-full items-center justify-center text-secondary'>
								<div className='h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent' />
							</div>
						) : currentFeed?.error ? (
							<div className='flex h-full items-center justify-center text-red-400'>
								<span>{currentFeed.error}</span>
							</div>
						) : (
							<div className='space-y-2'>
								{displayItems.map((item, index) => (
									<a
										key={index}
										href={item.link}
										target='_blank'
										rel='noopener noreferrer'
										className='block rounded-lg bg-white/20 p-2 transition-colors hover:bg-white/30'
									>
										<div className='truncate text-base font-medium text-primary'>{item.title}</div>
										<div className='mt-0.5 text-xs text-secondary'>{item.pubDate}</div>
									</a>
								))}
							</div>
						)}
					</div>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
