'use client'

import type { SiteContent } from '../../stores/config-store'

interface WecomSettingsProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
}

export function WecomSettings({ formData, setFormData }: WecomSettingsProps) {
	return (
		<div className='rounded-xl border border-border bg-card p-4'>
			<div className='mb-3 text-sm font-medium'>🚗 挪车通知</div>

			<div className='space-y-3'>
				<div>
					<label className='mb-1 block text-xs text-secondary'>微信 Webhook URL</label>
					<input
						type='text'
						value={formData.wecomWebhookUrl || ''}
						onChange={e => setFormData({ ...formData, wecomWebhookUrl: e.target.value })}
						placeholder='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...'
						className='w-full rounded-lg border px-4 py-2 text-sm'
					/>
				</div>

				<div>
					<label className='mb-1 block text-xs text-secondary'>车主联系电话（可选）</label>
					<input
						type='tel'
						value={formData.ncPhoneNumber || ''}
						onChange={e => setFormData({ ...formData, ncPhoneNumber: e.target.value })}
						placeholder='13800138000'
						className='w-full rounded-lg border px-4 py-2 text-sm'
					/>
				</div>

				<p className='text-secondary text-xs'>配置后关于页面显示挪车通知功能，留空则显示原关于页面</p>
			</div>
		</div>
	)
}
