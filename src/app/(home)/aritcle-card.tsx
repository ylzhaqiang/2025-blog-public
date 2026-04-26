import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import dayjs from 'dayjs'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function ArticleCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { items: blogs, loading } = useBlogIndex()
	const styles = cardStyles.articleCard
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width - CARD_SPACING - styles.width
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING

	const latestBlogs = [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)

	return (
		<HomeDraggableLayer cardKey='articleCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='max-sm:static'>
				<style>{`
					@keyframes auto-scroll {
						0% { transform: translateX(0); }
						100% { transform: translateX(-50%); }
					}
					.article-scroll:hover .article-scroll-content {
						animation-play-state: paused;
					}
					.article-scroll-content {
						animation: auto-scroll 30s linear infinite;
					}
				`}</style>

				{siteContent.enableChristmas && (
					<img src='/images/christmas/snow-9.webp' alt='' className='pointer-events-none absolute' style={{ width: 140, left: -12, top: -16, opacity: 0.8 }} />
				)}

				<div className='px-4 pt-2'>
					<h2 className='text-secondary text-sm'>最新文章</h2>
				</div>

				{loading ? (
					<div className='flex h-[72px] items-center justify-center'>
						<span className='text-secondary text-xs'>加载中...</span>
					</div>
				) : latestBlogs.length > 0 ? (
					<div className='article-scroll overflow-hidden px-4 pb-2' style={{ height: 76 }}>
						<div className='article-scroll-content flex gap-3' style={{ width: 'max-content' }}>
							{[...latestBlogs, ...latestBlogs].map((blog, i) => (
								<Link
									key={`${blog.slug}-${i}`}
									href={`/blog/${blog.slug}`}
									style={{ width: 120, flexShrink: 0 }}
									className='flex flex-col rounded-xl border border-transparent bg-white/40 p-1.5 transition-all hover:border-brand/30 hover:bg-white/60'>
									{blog.cover ? (
										<img src={blog.cover} alt='cover' className='rounded-lg border object-cover' style={{ width: '100%', height: 52 }} />
									) : (
										<div className='flex items-center justify-center rounded-lg bg-white/60 text-xs text-secondary' style={{ height: 52 }}>无封面</div>
									)}
									<div style={{ fontSize: 10, marginTop: 4, lineHeight: 1.2 }}>
										<div className='text-xs font-medium truncate'>{blog.title || blog.slug}</div>
										<div className='text-secondary text-[10px]'>{dayjs(blog.date).format('YYYY/M/D')}</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				) : (
					<div className='flex h-[72px] items-center justify-center'>
						<span className='text-secondary text-xs'>暂无文章</span>
					</div>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
