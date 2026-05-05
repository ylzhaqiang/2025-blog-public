import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const { message } = await req.json()

		if (!message) {
			return NextResponse.json({ errcode: -1, errmsg: '消息内容不能为空' }, { status: 400 })
		}

		const webhookUrl = process.env.WECOM_WEBHOOK_URL
		if (!webhookUrl) {
			return NextResponse.json({ errcode: -1, errmsg: '未配置 WECOM_WEBHOOK_URL 环境变量' }, { status: 500 })
		}

		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				msgtype: 'text',
				text: { content: message }
			})
		})

		const data = await res.json()
		return NextResponse.json(data)
	} catch (error: any) {
		console.error('Notify error:', error)
		return NextResponse.json({ errcode: -1, errmsg: error?.message || '请求失败' }, { status: 500 })
	}
}
