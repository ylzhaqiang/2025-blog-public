'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { HomeDraggableLayer } from '~/components/draggable-layer'
import { Card } from '~/components/card'
import { useSiteContent, useBlogIndex } from '~/contexts/data-context'
import { useSize } from '~/hooks/use-size'

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

export function RssReader() {
	const { siteContent } = useSiteContent()
	const { blogIndex } = useBlogIndex()
	const { maxSM } = useSize()
	const styles = siteContent.rssReader
	const show = siteContent.enableRssReader

	const [feeds, setFeeds] = useState<Feed[]>([])
	const [currentFeedIndex, setCurrentFeedIndex] = useState(0)
	const [position, setPosition] = useState({ x: 0, y: 0 })

	const fetchFeedRef = useRef<Record<number, boolean>>({})

	// Window size state for mobile
	const [windowHeight, setWindowHeight] = useState(800)
	const [windowWidth, setWindowWidth] = useState(400)

	useEffect(() => {
		setWindowHeight(window.innerHeight)
		setWindowWidth(window.innerWidth)
	}, [])

	// Compute card dimensions
	const cardWidth = maxSM ? windowWidth - 16 : (styles?.width || 360)
	const cardHeight = maxSM ? 480 : (styles?.height || 400)

	const currentFeed = feeds[currentFeedIndex]

	// Initialize feeds from config
	useEffect(() => {
		if (!styles?.feeds || styles.feeds.length === 0) return
		setFeeds(styles.feeds.map((url: string) => ({ url, title: '', items: [], loading: true })))
	}, [styles?.feeds])

	// Fetch each feed
	const loadFeed = useEffect(() => {
		feeds.forEach((feed, index) => {
			if (fetchFeedRef.current[index] || !feed.loading) return
			fetchFeedRef.current[index] = true
			setFeeds(prev => prev.map((f, i) => i === index ? { ...f, loading: true } : f))
			fetchFeed(feed.url).then(data => {
				setFeeds(prev => prev.map((f, i) => i === index ? {
					...f,
					title: data.feed?.title || '',
					items: data.items || [],
					loading: false,
					error: undefined
				} : f))
			}).catch(() => {
				setFeeds(prev => prev.map((f, i) => i === index ? {
					...f,
					error: '加载失败',
					loading: false
				} : f))
			}).finally(() => {
				fetchFeedRef.current[index] = false
			})
		})
	}, [feeds.length])

	// Fetch all feeds on mount
	useEffect(() => {
		if (feeds.length > 0) {
			feeds.forEach((_, index) => {
				if (!fetchFeedRef.current[index] && feeds[index].loading) {
					fetchFeedRef.current[index] = true
					fetchFeed(feeds[index].url).then(data => {
						setFeeds(prev => prev.map((f, i) => i === index ? {
							...f,
							title: data.feed?.title || '',
							items: data.items || [],
							loading: false
						} : f))
					}).catch(() => {
						setFeeds(prev => prev.map((f, i) => i === index ? { ...f, loading: false, error: '加载失败' } : f))
					}).finally(() => {
						fetchFeedRef.current[index] = false
					})
				}
			})
		}
	}, [feeds.length])

	const displayItems = currentFeed?.items.slice(0, 10) || []

	if (!show || styles?.enabled === false) return null

	return (
		<HomeDraggableLayer cardKey='rssReader' x={position.x} y={position.y} width={cardWidth} height={cardHeight}>
			<Card
				order={styles?.order || 9}
				width={cardWidth}
				height={cardHeight}
				x={position.x}
				y={position.y}
				className={maxSM ? 'max-sm:static' : ''}
			>
				{siteContent.enableChristmas && (
					<>
						<img src='/images/christmas/snow-5.webp' alt='Christmas decoration' className='pointer-events-none absolute' style={{ width: 60, left: 2, bottom: 2, opacity: 0.6 }} />
						<img src='/images/christmas/snow-6.webp' alt='Christmas decoration' className='pointer-events-none absolute' style={{ width: 80, right: -4, top: -10, opacity: 0.6 }} />
					</>
				)}
				<div className='flex h-full flex-col p-4 pt-2'>
					{/* Feed Tabs */}
					{feeds.length > 1 && (
						<div className='mb-2 flex flex-wrap gap-1'>
							{feeds.map((feed, index) => (
								<button
									key={feed.url}
									onClick={() => setCurrentFeedIndex(index)}
									className={`whitespace-nowrap rounded-full px-2 py-0.5 text-base transition-colors ${
										index === currentFeedIndex
											? 'bg-brand text-white'
											: 'bg-white/30 text-secondary hover:bg-white/40'
									}`}>
									{feed.title || `源 ${index + 1}`}
								</button>
							))}
						</div>
					)}

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
