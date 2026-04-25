'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'

interface RssItem {
	title: string
	link: string
	pubDate: string
	description: string
}

export default function RssReader() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.rssReader
	const hiCardStyles = cardStyles.hiCard

	const [show, setShow] = useState(false)
	const [currentFeedIndex, setCurrentFeedIndex] = useState(0)
	const [feeds, setFeeds] = useState<{
		url: string
		title: string
		items: RssItem[]
		loading: boolean
		error: string | null
	}[]>([])

	const rssFeeds = siteContent.rssFeeds || []

	const position = {
		x: styles?.offsetX !== null ? center.x + (styles?.offsetX || 0) : center.x - (styles?.width || 360) / 2,
		y: styles?.offsetY !== null ? center.y + (styles?.offsetY || 0) : center.y + (hiCardStyles?.height || 288) + 32
	}

	useEffect(() => {
		setShow(true)
	}, [])

	// Initialize feeds
	useEffect(() => {
		if (rssFeeds.length > 0) {
			setFeeds(rssFeeds.map((feed: { url: string; title?: string }) => ({
				url: feed.url,
				title: feed.title || feed.url,
				items: [],
				loading: false,
				error: null
			})))
		}
	}, [rssFeeds])

	// Fetch RSS feed - 使用 ref 存储 fetch 函数避免闭包问题
	const fetchFeedRef = useRef<Record<number, boolean>>({})

	const fetchFeed = useCallback(async (feed: { url: string; title: string }, index: number) => {
		if (!feed.url || fetchFeedRef.current[index]) return
		fetchFeedRef.current[index] = true

		setFeeds(prev => prev.map((f, i) => i === index ? { ...f, loading: true, error: null } : f))

		try {
			const response = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`)
			if (!response.ok) throw new Error('Failed to fetch feed')
			const data = await response.json()

			setFeeds(prev => prev.map((f, i) => i === index ? {
				...f,
				items: data.items || [],
				loading: false
			} : f))
		} catch (error) {
			setFeeds(prev => prev.map((f, i) => i === index ? {
				...f,
				error: '加载失败',
				loading: false
			} : f))
		} finally {
			fetchFeedRef.current[index] = false
		}
	}, [])

	// Fetch all feeds on mount
	useEffect(() => {
		if (feeds.length > 0) {
			feeds.forEach((feed, index) => {
				if (feed.url && feed.items.length === 0 && !feed.loading) {
					fetchFeed(feed, index)
				}
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [feeds.length])

	const currentFeed = feeds[currentFeedIndex]

	if (!show || styles?.enabled === false) return null

	const displayItems = currentFeed?.items.slice(0, 10) || []

	return (
		<HomeDraggableLayer cardKey='rssReader' x={position.x} y={position.y} width={styles?.width || 360} height={styles?.height || 400}>
			<Card
				order={styles?.order || 9}
				width={styles?.width || 360}
				height={styles?.height || 400}
				x={position.x}
				y={position.y}>
				<div className='flex h-full flex-col p-4 pt-2'>
					{/* Feed Tabs */}
					{feeds.length > 1 && (
						<div className='mb-2 flex flex-wrap gap-1'>
							{feeds.map((feed, index) => (
								<button
									key={feed.url}
									onClick={() => setCurrentFeedIndex(index)}
									className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs transition-colors ${
										index === currentFeedIndex
											? 'bg-brand text-white'
											: 'bg-white/30 text-secondary hover:bg-white/40'
									}`}>
									{feed.title}
								</button>
							))}
						</div>
					)}

					{/* Content */}
					<div className='flex-1 overflow-y-auto'>
						{currentFeed?.loading ? (
							<div className='flex h-full items-center justify-center text-secondary text-sm'>
								加载中...
							</div>
						) : currentFeed?.error ? (
							<div className='flex h-full items-center justify-center text-red-500 text-sm'>
								{currentFeed.error}
							</div>
						) : displayItems.length === 0 ? (
							<div className='flex h-full items-center justify-center text-secondary text-sm'>
								暂无内容，请先在设置中添加订阅源
							</div>
						) : (
							<div className='space-y-2'>
								{displayItems.map((item, index) => (
									<a
										key={index}
										href={item.link}
										target='_blank'
										rel='noopener noreferrer'
										className='block rounded-lg border border-border/30 bg-white/20 p-2 transition-colors hover:bg-white/30'>
										<div className='text-base font-medium line-clamp-1'>{item.title}</div>
										<div className='text-secondary mt-1 text-xs line-clamp-1'>{item.description}</div>
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
