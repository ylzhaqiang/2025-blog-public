'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import LogoUploadDialog, { type LogoItem } from './logo-upload-dialog'
import type { Share } from './share-card'
import { DialogModal } from '@/components/dialog-modal'

interface CreateDialogProps {
	share: Share | null
	onClose: () => void
	onSave: (share: Share) => void
}

export default function CreateDialog({ share, onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<Share>({
		name: '',
		logo: '',
		url: '',
		internalUrl: '',
		description: '',
		tags: [],
		stars: 3
	})
	const [showLogoDialog, setShowLogoDialog] = useState(false)
	const [tagsInput, setTagsInput] = useState('')

	useEffect(() => {
		if (share) {
			setFormData(share)
			setTagsInput(share.tags.join(', '))
		} else {
			setFormData({
				name: '',
				logo: '',
				url: '',
				internalUrl: '',
				description: '',
				tags: [],
				stars: 3
			})
			setTagsInput('')
		}
	}, [share])

	const handleLogoSubmit = (logo: LogoItem) => {
		const logoUrl = logo.type === 'url' ? logo.url : `/images/share/${logo.file.name}`
		setFormData({ ...formData, logo: logoUrl })
	}

	const handleTagsChange = (value: string) => {
		setTagsInput(value)
		const tags = value
			.split(',')
			.map(t => t.trim())
			.filter(t => t)
		setFormData({ ...formData, tags })
	}

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.logo.trim() || !formData.url.trim()) {
			toast.error('请填写所有必填项')
			return
		}

		if (formData.tags.length === 0) {
			toast.error('请至少添加一个标签')
			return
		}

		onSave(formData)
		onClose()
		toast.success(share ? '更新成功' : '添加成功')
	}

	return (
		<DialogModal open onClose={onClose} className='card max-h-[90vh] w-sm overflow-y-auto'>
			{/* 卡片样式的内容 */}
			<div className='flex flex-col items-center gap-4'>
				{/* 头像：居中 */}
				<div className='group relative cursor-pointer' onClick={() => setShowLogoDialog(true)}>
					{formData.logo ? (
						<>
							<img src={formData.logo.startsWith('http') || formData.logo.startsWith('/') ? formData.logo : `/images/share-logos/${formData.logo}`} alt={formData.name} className='h-20 w-20 rounded-xl object-cover' />
							<div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
								<span className='text-xs text-white'>更换</span>
							</div>
						</>
					) : (
						<div className='flex h-20 w-20 items-center justify-center rounded-xl bg-gray-200'>
							<Plus className='h-8 w-8 text-gray-500' />
						</div>
					)}
				</div>

				{/* 名称 */}
				<input
					type='text'
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
					placeholder='资源名称'
					className='w-full max-w-[280px] text-center text-lg font-bold focus:outline-none'
				/>

				{/* 外网网址 */}
				<div className='w-full max-w-[280px]'>
					<label className='text-secondary mb-1 block text-center text-xs'>外网</label>
					<input
						type='text'
						value={formData.url}
						onChange={e => setFormData({ ...formData, url: e.target.value })}
						placeholder='https://...'
						className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs focus:outline-none'
					/>
				</div>

				{/* 内网网址 */}
				<div className='w-full max-w-[280px]'>
					<label className='text-secondary mb-1 block text-center text-xs'>内网</label>
					<input
						type='text'
						value={formData.internalUrl || ''}
						onChange={e => setFormData({ ...formData, internalUrl: e.target.value })}
						placeholder='内网访问地址（可选）'
						className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs focus:outline-none'
					/>
				</div>

				{/* 标签输入 */}
				<div className='w-full max-w-[280px]'>
					<input
						type='text'
						value={tagsInput}
						onChange={e => handleTagsChange(e.target.value)}
						placeholder='标签，用逗号分隔'
						className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs focus:outline-none'
					/>
					<div className='mt-2 flex flex-wrap justify-center gap-1.5'>
						{formData.tags.map(tag => (
							<span key={tag} className='rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs'>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* 操作按钮 */}
			<div className='mt-6 flex gap-3'>
				<button onClick={onClose} className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>
					取消
				</button>
				<button onClick={handleSubmit} className='brand-btn flex-1 justify-center px-4'>
					{share ? '保存' : '添加'}
				</button>
			</div>

			{showLogoDialog && <LogoUploadDialog currentLogo={formData.logo} onClose={() => setShowLogoDialog(false)} onSubmit={handleLogoSubmit} />}
		</DialogModal>
	)
}
