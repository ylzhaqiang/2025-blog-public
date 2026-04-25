import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const url = searchParams.get('url')

	if (!url) {
		return Response.json({ error: 'URL is required' }, { status: 400 })
	}

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader Bot/1.0)',
				'Accept': 'application/rss+xml, application/xml, text/xml, */*'
			},
			next: { revalidate: 300 }
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const xml = await response.text()

		const items: { title: string; link: string; pubDate: string; description: string }[] = []

		const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
		let match

		while ((match = itemRegex.exec(xml)) !== null) {
			const itemXml = match[1]

			const getTagContent = (tag: string): string => {
				const tagRegex = new RegExp(`<${tag}[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/${tag}>|<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i')
				const tagMatch = itemXml.match(tagRegex)
				return tagMatch ? (tagMatch[1] || tagMatch[2] || '').trim() : ''
			}

			const title = getTagContent('title')
			const link = getTagContent('link')
			const pubDate = getTagContent('pubDate')
			const description = getTagContent('description')

			if (title) {
				items.push({
					title,
					link,
					pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
					description: description.replace(/<[^>]*>/g, '').slice(0, 200)
				})
			}

			if (items.length >= 20) break
		}

		const channelTitleMatch = xml.match(/<channel[^>]*>[\s\S]*?<title[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i)
		const channelTitle = channelTitleMatch ? (channelTitleMatch[1] || channelTitleMatch[2] || '').trim() : 'RSS Feed'

		return Response.json({
			title: channelTitle,
			items
		})
	} catch (error) {
		console.error('RSS fetch error:', error)
		return Response.json({ error: 'Failed to fetch RSS feed' }, { status: 500 })
	}
}
