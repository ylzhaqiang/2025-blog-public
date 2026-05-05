'use client'

import type { SiteContent } from '../../stores/config-store'

interface WecomSettingsProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
}

export function WecomSettings({ formData, setFormData }: WecomSettingsProps) {
	return (
		<div className='rounded-xl border border-border bg-card p-4'>
			<div className='mb-3 text-sm font-medium'>🚗 挪车通知（企业微信）</div>
			<input
				type='text'
				value={formData.wecomWebhookUrl || ''}
				onChange={e => setFormData({ ...formData, wecomWebhookUrl: e.target.value })}
				placeholder='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...'
				className='w-full rounded-lg border px-4 py-2 text-sm'
			/>
			<p className='text-secondary mt-1 text-xs'>设置后关于页面将替换为挪车通知功能，留空则显示原关于页面内容</p>
		</div>
	)
}
