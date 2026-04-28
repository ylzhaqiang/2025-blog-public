'use client'

import { motion } from 'motion/react'
import { useSize } from '@/hooks/use-size'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'
import LogoUploadDialog, { type LogoItem } from './logo-upload-dialog'

export interface Share {
	name: string
	logo: string
	url: string
	internalUrl?: string
	description: string
	tags: string[]
	stars: number
}

interface ShareCardProps {
	share: Share
	isEditMode?: boolean
	onUpdate?: (share: Share, oldShare: Share, logoItem?: LogoItem) => void
	onDelete?: () => void
}

export function ShareCard({ share, isEditMode = false, onUpdate, onDelete }: ShareCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const { maxSM } = useSize()
	const [localShare, setLocalShare] = useState(share)
	const [showLogoDialog, setShowLogoDialog] = useState(false)
	const [logoItem, setLogoItem] = useState<LogoItem | null>(null)
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
	const contextMenuRef = useRef<HTMLDivElement>(null)

	// 同步 share prop 的变化（保存后 logo 更新）
	useEffect(() => {
		setLocalShare(share)
	}, [share])

	// 点击其他地方关闭右键菜单
	useEffect(() => {
		const handleClick = () => setContextMenu(null)
		if (contextMenu) {
			document.addEventListener('click', handleClick)
			return () => document.removeEventListener('click', handleClick)
		}
	}, [contextMenu])

	const handleFieldChange = (field: keyof Share, value: any) => {
		const updated = { ...localShare, [field]: value }
		setLocalShare(updated)
		onUpdate?.(updated, share, logoItem || undefined)
	}

	const handleLogoSubmit = (logo: LogoItem) => {
		setLogoItem(logo)
		const logoUrl = logo.type === 'url' ? logo.url : `/images/share/${logo.file.name}`
		const updated = { ...localShare, logo: logoUrl }
		setLocalShare(updated)
		onUpdate?.(updated, share, logo)
	}

	const handleTagsChange = (tagsStr: string) => {
		const tags = tagsStr
			.split(',')
			.map(t => t.trim())
			.filter(t => t)
		handleFieldChange('tags', tags)
	}

	const handleCancel = () => {
		setLocalShare(share)
		setIsEditing(false)
		setLogoItem(null)
	}

	const handleContextMenu = (e: React.MouseEvent) => {
		if (isEditMode) return // 编辑模式下不显示右键菜单
		e.preventDefault()
		setContextMenu({ x: e.clientX, y: e.clientY })
	}

	const canEdit = isEditMode && isEditing

	// 非编辑模式：紧凑显示
	if (!canEdit) {
		return (
			<>
				<motion.a
					href={share.url}
					target='_blank'
					rel='noopener noreferrer'
					onContextMenu={handleContextMenu}
					initial={{ opacity: 0, scale: 0.6 }}
					{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
					className='card relative block overflow-hidden' style={{ textDecoration: 'none' }}>
					{isEditMode && (
						<div className='absolute top-1 right-1 z-10 flex gap-1'>
							<button
								onClick={e => { e.preventDefault(); e.stopPropagation(); setIsEditing(true) }}
								className='rounded-lg bg-white/80 p-1.5 text-gray-500 shadow-sm hover:bg-white hover:text-blue-500'
								style={{ width: 28, height: 28 }}>
								<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
									<path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
								</svg>
							</button>
							<button
								onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete?.() }}
								className='rounded-lg bg-white/80 p-1.5 text-gray-500 shadow-sm hover:bg-white hover:text-red-500'
								style={{ width: 28, height: 28 }}>
								<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
									<polyline points='3 6 5 6 21 6' />
									<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
								</svg>
							</button>
						</div>
					)}
					<div className='flex items-center gap-2 p-2'>
						<img src={localShare.logo.startsWith('http') || localShare.logo.startsWith('/') ? localShare.logo : `/images/share-logos/${localShare.logo}`} alt={localShare.name} className='h-12 w-12 rounded-lg object-cover' />
						<span className='text-xs font-medium text-foreground truncate'>{localShare.name}</span>
					</div>
				</motion.a>

				{/* 右键菜单 */}
				{contextMenu && (
					<div
						ref={contextMenuRef}
						className='fixed z-50 min-w-[120px] rounded-lg border bg-white py-1 shadow-lg'
						style={{ left: contextMenu.x, top: contextMenu.y }}
						onClick={e => e.stopPropagation()}>
						<button
							className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
							onClick={() => {
								window.open(share.url, '_blank')
								setContextMenu(null)
							}}>
							外网访问
						</button>
						{share.internalUrl && (
							<button
								className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
								onClick={() => {
									window.open(share.internalUrl, '_blank')
									setContextMenu(null)
								}}>
								内网访问
							</button>
						)}
						{isEditMode && (
							<>
								<div className='my-1 border-t' />
								<button
									className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
									onClick={() => {
										setIsEditing(true)
										setContextMenu(null)
									}}>
									编辑卡片
								</button>
							</>
						)}
					</div>
				)}
			</>
		)
	}

	// 编辑模式：完整界面
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.6 }}
			{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
			className='card relative block overflow-hidden'>
			{isEditMode && (
				<div className='absolute top-3 right-3 z-10 flex gap-2'>
					{isEditing ? (
						<>
							<button onClick={handleCancel} className='rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600'>
								取消
							</button>
							<button onClick={() => setIsEditing(false)} className='rounded-lg px-2 py-1.5 text-xs text-blue-400 transition-colors hover:text-blue-600'>
								完成
							</button>
						</>
					) : (
						<>
							<button onClick={() => setIsEditing(true)} className='rounded-lg px-2 py-1.5 text-xs text-blue-400 transition-colors hover:text-blue-600'>
								编辑
							</button>
							<button onClick={onDelete} className='rounded-lg px-2 py-1.5 text-xs text-red-400 transition-colors hover:text-red-600'>
								删除
							</button>
						</>
					)}
				</div>
			)}

			<div className='flex flex-col items-center gap-4 py-6'>
				{/* 头像：居中 */}
				<div className='group relative'>
					<img
						src={localShare.logo.startsWith('http') || localShare.logo.startsWith('/') ? localShare.logo : `/images/share-logos/${localShare.logo}`}
						alt={localShare.name}
						className={cn('h-20 w-20 rounded-xl object-cover', canEdit && 'cursor-pointer')}
						onClick={() => canEdit && setShowLogoDialog(true)}
					/>
					{canEdit && (
						<div className='ev pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
							<span className='text-xs text-white'>更换</span>
						</div>
					)}
				</div>

				{/* 名称：居中 */}
				<div className='w-full max-w-[280px]'>
					<h3
						contentEditable={canEdit}
						suppressContentEditableWarning
						onBlur={e => handleFieldChange('name', e.currentTarget.textContent || '')}
						className={cn('text-center text-lg font-bold transition-colors focus:outline-none', canEdit && 'cursor-text')}>
						{localShare.name}
					</h3>
				</div>

				{/* 外网网址：在名称下方居中 */}
				<div className='w-full max-w-[280px]'>
					<label className='text-secondary mb-1 block text-center text-xs'>外网</label>
					{canEdit ? (
						<input
							type='text'
							value={localShare.url}
							onChange={e => handleFieldChange('url', e.target.value)}
							placeholder='https://...'
							className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs focus:outline-none'
						/>
					) : (
						<a
							href={localShare.url}
							target='_blank'
							rel='noopener noreferrer'
							className='text-secondary text-center hover:text-brand block max-w-[200px] mx-auto truncate text-xs hover:underline'>
							{localShare.url}
						</a>
					)}
				</div>

				{/* 内网网址：在外网网址下方居中 */}
				<div className='w-full max-w-[280px]'>
					<label className='text-secondary mb-1 block text-center text-xs'>内网</label>
					{canEdit ? (
						<input
							type='text'
							value={localShare.internalUrl || ''}
							onChange={e => handleFieldChange('internalUrl', e.target.value)}
							placeholder='内网访问地址（可选）'
							className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs focus:outline-none'
						/>
					) : localShare.internalUrl ? (
						<a
							href={localShare.internalUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='text-secondary text-center hover:text-brand block max-w-[200px] mx-auto truncate text-xs hover:underline'>
							{localShare.internalUrl}
						</a>
					) : (
						<span className='text-secondary text-center block text-xs italic'>未设置</span>
					)}
				</div>

				{/* 标签：在内网网址下方居中 */}
				<div className='w-full max-w-[280px]'>
					{canEdit ? (
						<input
							type='text'
							value={localShare.tags.join(', ')}
							onChange={e => handleTagsChange(e.target.value)}
							placeholder='标签，用逗号分隔'
							className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs focus:outline-none'
						/>
					) : (
						<div className='flex flex-wrap justify-center gap-1.5'>
							{localShare.tags.map(tag => (
								<span key={tag} className='bg-secondary/10 rounded-full px-2.5 py-0.5 text-xs'>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</div>

			{canEdit && showLogoDialog && <LogoUploadDialog currentLogo={localShare.logo} onClose={() => setShowLogoDialog(false)} onSubmit={handleLogoSubmit} />}
		</motion.div>
	)
}
