import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const feedUrl = searchParams.get('url')

	if (!feedUrl) {
		return Response.json({ error: 'URL is required' }, { status: 400 })
	}

	try {
		// 使用 rss2json 服务转换 RSS
		const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
		const response = await fetch(apiUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader Bot/1.0)'
			},
			next: { revalidate: 300 }
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()

		if (data.status !== 'ok') {
			throw new Error(data.message || 'Failed to parse RSS')
		}

		const items = (data.items || []).slice(0, 20).map((item: any) => ({
			title: item.title || '',
			link: item.link || '',
			pubDate: item.pubDate || new Date().toISOString(),
			description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 200)
		}))

		return Response.json({
			title: data.feed?.title || 'RSS Feed',
			items
		})
	} catch (error) {
		console.error('RSS fetch error:', error)
		return Response.json({ error: 'Failed to fetch RSS feed' }, { status: 500 })
	}
}
