'use client'

import type { SiteContent } from '../../stores/config-store'
import { useState } from 'react'

interface RssFeedsSectionProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
}

export function RssFeedsSection({ formData, setFormData }: RssFeedsSectionProps) {
	const [newFeedUrl, setNewFeedUrl] = useState('')
	const [newFeedTitle, setNewFeedTitle] = useState('')

	const rssFeeds = formData.rssFeeds || []

	const addFeed = () => {
		if (!newFeedUrl.trim()) return

		const newFeed = {
			url: newFeedUrl.trim(),
			title: newFeedTitle.trim() || newFeedUrl.trim()
		}

		setFormData({
			...formData,
			rssFeeds: [...rssFeeds, newFeed]
		})

		setNewFeedUrl('')
		setNewFeedTitle('')
	}

	const removeFeed = (index: number) => {
		setFormData({
			...formData,
			rssFeeds: rssFeeds.filter((_: any, i: number) => i !== index)
		})
	}

	const updateFeedTitle = (index: number, title: string) => {
		setFormData({
			...formData,
			rssFeeds: rssFeeds.map((feed: any, i: number) =>
				i === index ? { ...feed, title } : feed
			)
		})
	}

	return (
		<div className='rounded-xl border border-border bg-card p-4'>
			<div className='mb-4 flex items-center gap-2'>
				<svg className='size-5 text-orange-500' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<path d='M4 11a9 9 0 0 1 9 9' />
					<path d='M4 4a16 16 0 0 1 16 16' />
					<circle cx='5' cy='19' r='1' />
				</svg>
				<span className='text-sm font-medium'>RSS 订阅源</span>
			</div>

			<div className='space-y-3'>
				{rssFeeds.map((feed: { url: string; title?: string }, index: number) => (
					<div key={index} className='flex items-center gap-2 rounded-lg border border-border/50 bg-white/20 p-2'>
						<div className='flex-1 min-w-0'>
							<input
								type='text'
								value={feed.title || ''}
								onChange={e => updateFeedTitle(index, e.target.value)}
								placeholder='订阅源标题'
								className='w-full rounded-lg border border-border/30 bg-transparent px-2 py-1 text-xs focus:border-brand focus:outline-none'
							/>
							<input
								type='text'
								value={feed.url}
								readOnly
								className='mt-1 w-full rounded-lg border border-border/30 bg-transparent px-2 py-1 text-xs text-secondary'
							/>
						</div>
						<button
							onClick={() => removeFeed(index)}
							className='text-secondary hover:text-red-500 rounded-lg p-1 transition-colors'>
							<svg className='size-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>
					</div>
				))}

				<div className='flex items-center gap-2'>
					<input
						type='text'
						value={newFeedTitle}
						onChange={e => setNewFeedTitle(e.target.value)}
						placeholder='订阅源标题（可选）'
						className='flex-1 rounded-lg border border-border/30 bg-white/20 px-3 py-1.5 text-xs focus:border-brand focus:outline-none'
					/>
					<input
						type='url'
						value={newFeedUrl}
						onChange={e => setNewFeedUrl(e.target.value)}
						placeholder='订阅源 URL'
						className='flex-[2] rounded-lg border border-border/30 bg-white/20 px-3 py-1.5 text-xs focus:border-brand focus:outline-none'
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()
								addFeed()
							}
						}}
					/>
					<button
						onClick={addFeed}
						disabled={!newFeedUrl.trim()}
						className='rounded-lg bg-brand px-3 py-1.5 text-xs text-white disabled:opacity-50'>
						添加
					</button>
				</div>
			</div>
		</div>
	)
}
