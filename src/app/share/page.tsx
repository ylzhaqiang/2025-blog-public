'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import GridView from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushShares } from './services/push-shares'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import type { Share } from './components/share-card'
import type { LogoItem } from './components/logo-upload-dialog'

interface ContextMenuState {
	x: number
	y: number
	share: Share
}

export default function Page() {
	const [shares, setShares] = useState<Share[]>(initialList as Share[])
	const [originalShares, setOriginalShares] = useState<Share[]>(initialList as Share[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingShare, setEditingShare] = useState<Share | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [logoItems, setLogoItems] = useState<Map<string, LogoItem>>(new Map())
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdate = (updatedShare: Share, oldShare: Share, logoItem?: LogoItem) => {
		setShares(prev => prev.map(s => (s.url === oldShare.url ? updatedShare : s)))
		if (logoItem) {
			setLogoItems(prev => {
				const newMap = new Map(prev)
				newMap.set(oldShare.url, logoItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingShare(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveShare = (updatedShare: Share) => {
		if (editingShare) {
			const updated = shares.map(s => (s.url === editingShare.url ? updatedShare : s))
			setShares(updated)
		} else {
			setShares([...shares, updatedShare])
		}
	}

	const handleDelete = (share: Share) => {
		if (confirm(`确定要删除 ${share.name} 吗？`)) {
			setShares(shares.filter(s => s.url !== share.url))
		}
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			// 选择文件后自动保存
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushShares({
				shares,
				logoItems
			})

			setOriginalShares(shares)
			setLogoItems(new Map())
			setIsEditMode(false)
			setContextMenu(null)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setShares(originalShares)
		setLogoItems(new Map())
		setIsEditMode(false)
		setContextMenu(null)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	// 拖拽排序
	const handleDragStart = (index: number) => {
		if (!isEditMode) return
		setDraggedIndex(index)
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		if (!isEditMode || draggedIndex === null) return
		e.preventDefault()
		setDragOverIndex(index)
	}

	const handleDrop = (e: React.DragEvent, targetIndex: number) => {
		if (!isEditMode || draggedIndex === null) return
		e.preventDefault()
		if (draggedIndex === targetIndex) {
			setDraggedIndex(null)
			setDragOverIndex(null)
			return
		}
		const newShares = [...shares]
		const [draggedItem] = newShares.splice(draggedIndex, 1)
		newShares.splice(targetIndex, 0, draggedItem)
		setShares(newShares)
		setDraggedIndex(null)
		setDragOverIndex(null)
	}

	const handleDragEnd = () => {
		setDraggedIndex(null)
		setDragOverIndex(null)
	}

	// 右键菜单
	const handleContextMenu = (e: React.MouseEvent, share: Share) => {
		if (isEditMode) return
		e.preventDefault()
		setContextMenu({ x: e.clientX, y: e.clientY, share })
	}

	const handleCloseContextMenu = () => {
		setContextMenu(null)
	}

	// 点击其他地方关闭右键菜单
	useEffect(() => {
		const handleClick = () => setContextMenu(null)
		if (contextMenu) {
			document.addEventListener('click', handleClick)
			return () => document.removeEventListener('click', handleClick)
		}
	}, [contextMenu])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<GridView
				shares={shares}
				isEditMode={isEditMode}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				draggedIndex={draggedIndex}
				dragOverIndex={dragOverIndex}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				onDragEnd={handleDragEnd}
				onContextMenu={handleContextMenu}
			/>

			{/* 右键菜单 - 放在页面级别，只显示一个 */}
			{contextMenu && (
				<div
					className='fixed z-50 rounded-lg border border-gray-200/50 bg-white/80 py-1 shadow-lg backdrop-blur-sm'
					style={{ left: contextMenu.x, top: contextMenu.y }}
					onClick={e => e.stopPropagation()}>
					<button
						className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100/80 whitespace-nowrap'
						onClick={() => {
							window.open(contextMenu.share.url, '_blank')
							handleCloseContextMenu()
						}}>
						外网访问
					</button>
					{contextMenu.share.internalUrl && (
						<button
							className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100/80 whitespace-nowrap'
							onClick={() => {
								window.open(contextMenu.share.internalUrl, '_blank')
								handleCloseContextMenu()
							}}>
							内网访问
						</button>
					)}
					{isEditMode && (
						<>
							<div className='my-1 border-t border-gray-200/50' />
							<button
								className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100/80 whitespace-nowrap'
								onClick={() => {
									handleCloseContextMenu()
									setEditingShare(contextMenu.share)
									setIsCreateDialogOpen(true)
								}}>
								编辑卡片
							</button>
						</>
					)}
				</div>
			)}

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='absolute top-4 right-6 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleAdd}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							添加
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsEditMode(true)}
							className='bg-card rounded-xl border px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>

			{isCreateDialogOpen && <CreateDialog share={editingShare} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveShare} />}
		</>
	)
}
