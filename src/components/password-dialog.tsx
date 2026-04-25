'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { DialogModal } from '@/components/dialog-modal'

interface PasswordDialogProps {
	open: boolean
	password: string
	onSuccess: () => void
	onCancel: () => void
}

export function PasswordDialog({ open, password, onSuccess, onCancel }: PasswordDialogProps) {
	const [input, setInput] = useState('')
	const [error, setError] = useState(false)

	const handleSubmit = () => {
		if (input === password) {
			setInput('')
			setError(false)
			onSuccess()
		} else {
			setError(true)
		}
	}

	const handleCancel = () => {
		setInput('')
		setError(false)
		onCancel()
	}

	return (
		<DialogModal open={open} onClose={handleCancel} disableCloseOnOverlay>
			<div className='card flex flex-col items-center justify-center gap-4 p-8'>
				<div className='text-lg font-medium'>请输入访问密码</div>
				<input
					type='password'
					value={input}
					onChange={e => {
						setInput(e.target.value)
						setError(false)
					}}
					onKeyDown={e => {
						if (e.key === 'Enter') handleSubmit()
					}}
					placeholder='输入密码...'
					className='w-full rounded-xl border-2 border-border bg-card px-4 py-2 text-center focus:border-brand focus:outline-none'
					autoFocus
				/>
				{error && <div className='text-red-500 text-sm'>密码错误，请重试</div>}
				<div className='flex gap-3'>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleCancel}
						className='bg-card rounded-xl border px-6 py-2'>
						取消
					</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} className='brand-btn px-6'>
						确认
					</motion.button>
				</div>
			</div>
		</DialogModal>
	)
}