'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'

const TEMPLATES = [
	{ label: '挪车', text: '您好，有人需要您挪车，请及时处理。' },
	{ label: '未关窗', text: '车主，您爱车的车窗未关，请及时处理一下哦。' },
	{ label: '未关灯', text: '车主，您爱车的车灯未关，请及时处理一下哦。' },
	{ label: '交警', text: '交警来了！赶快开走！' },
]

const MAX_CHARS = 200
const MAX_SUBMISSIONS = 5
const RESET_MS = 24 * 60 * 60 * 1000

function getSubmitCount(): number {
	if (typeof window === 'undefined') return 0
	const last = localStorage.getItem('nc_last_submit')
	const now = Date.now()
	if (last && now - Number(last) < RESET_MS) {
		return Number(localStorage.getItem('nc_submit_count')) || 0
	}
	localStorage.setItem('nc_last_submit', String(now))
	localStorage.setItem('nc_submit_count', '0')
	return 0
}

function saveSubmitCount(count: number) {
	localStorage.setItem('nc_submit_count', String(count))
}

export default function Page() {
	const { siteContent } = useConfigStore()
	const webhookUrl = siteContent.wecomWebhookUrl || ''
	const [message, setMessage] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [submitCount, setSubmitCount] = useState(0)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setSubmitCount(getSubmitCount())
		setMounted(true)
	}, [])

	const charCount = message.length
	const overLimit = charCount > MAX_CHARS
	const canSubmit = mounted && !overLimit && message.trim().length > 0 && submitCount < MAX_SUBMISSIONS && !submitting && !!webhookUrl

	const useTemplate = useCallback((text: string) => {
		setMessage(text)
	}, [])

	const handleSubmit = useCallback(async () => {
		if (!canSubmit) return

		setSubmitting(true)
		try {
			const res = await fetch('/api/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: message.trim(), webhookUrl })
			})
			const data = await res.json()

			if (data.errcode === 0) {
				toast.success('通知已发送！')
				setMessage('')
				const newCount = submitCount + 1
				setSubmitCount(newCount)
				saveSubmitCount(newCount)
			} else {
				toast.error(data.errmsg || '发送失败，请稍后重试')
			}
		} catch (e: any) {
			toast.error('网络错误，请检查连接')
		} finally {
			setSubmitting(false)
		}
	}, [canSubmit, message, submitCount, webhookUrl])

	return (
		<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
			<div className='w-full max-w-[480px]'>
				{/* Car icon */}
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'spring', stiffness: 200 }}
					className='mb-2 text-center'>
					<motion.span
						animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }}
						transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
						className='inline-block text-6xl'>
						🚗
					</motion.span>
				</motion.div>

				{/* Title */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='mb-8 text-center'>
					<h1 className='mb-2 text-xl font-bold'>不好意思阻碍到您的出行了</h1>
					<p className='text-secondary text-sm'>您可留言通知我，我会立即前来挪车</p>
				</motion.div>

				{/* Template buttons */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='mb-3 grid grid-cols-4 gap-2'>
					{TEMPLATES.map(t => (
						<button
							key={t.label}
							onClick={() => useTemplate(t.text)}
							className='btn-rounded border bg-white/60 px-2 py-2 text-sm text-secondary backdrop-blur-sm transition-colors hover:bg-white/80 max-sm:text-xs'>
							{t.label}
						</button>
					))}
				</motion.div>

				{/* Textarea */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className='card !relative mb-2 !p-3'>
					<textarea
						value={message}
						onChange={e => setMessage(e.target.value)}
						placeholder='请输入通知内容'
						maxLength={MAX_CHARS + 50}
						className='min-h-[100px] w-full resize-none bg-transparent text-sm outline-none'
					/>
					<div className={`text-right text-xs ${overLimit ? 'text-red-500' : 'text-secondary'}`}>
						{overLimit ? '内容过多，无法发送！' : `${charCount}/${MAX_CHARS}`}
					</div>
				</motion.div>

				{/* Daily limit info */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.35 }}
					className='text-secondary mb-3 text-center text-xs'>
					{mounted ? `今日剩余 ${MAX_SUBMISSIONS - submitCount} / ${MAX_SUBMISSIONS} 次` : ''}
				</motion.p>

				{/* Submit button */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className='flex flex-col gap-3'>
					<button
						onClick={handleSubmit}
						disabled={!canSubmit}
						className={`brand-btn w-full justify-center py-3 text-base ${
							!canSubmit ? 'cursor-not-allowed opacity-50' : ''
						}`}>
						{submitting
							? '发送中...'
							: !webhookUrl
								? '请先在站点设置中配置 Webhook'
								: submitCount >= MAX_SUBMISSIONS
									? '今日已达上限'
									: `企业微信通知 📱`}
					</button>
				</motion.div>

				{/* Bottom links */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className='mt-10 flex items-center justify-center gap-6'>
					<motion.a
						href='https://github.com/YYsuni/2025-blog-public'
						target='_blank'
						rel='noreferrer'
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'>
						<GithubSVG />
					</motion.a>
					<LikeButton slug='open-source' delay={0} />
				</motion.div>
			</div>
		</div>
	)
}
