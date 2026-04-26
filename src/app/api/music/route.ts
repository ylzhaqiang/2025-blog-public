import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
	try {
		const musicDir = join(process.cwd(), 'public', 'music')
		const files = await readdir(musicDir)
		const musicFiles = files
			.filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg') || f.endsWith('.m4a') || f.endsWith('.aac'))
			.map(file => {
				const name = file.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, '')
				return {
					name,
					file: `/music/${file}`
				}
			})
		return Response.json(musicFiles)
	} catch (error) {
		return Response.json([], { status: 200 })
	}
}
