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
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='space-y-2 max-sm:static'>
				<style>{`
					@keyframes auto-scroll {
						0% { transform: translateX(0); }
						100% { transform: translateX(-50%); }
					}
					.scroll-container:hover .scroll-content {
						animation-play-state: paused;
					}
					.scroll-content {
						animation: auto-scroll 30s linear infinite;
					}
				`}</style>

				{siteContent.enableChristmas && (
					<img src='/images/christmas/snow-9.webp' alt='' className='pointer-events-none absolute' style={{ width: 140, left: -12, top: -16, opacity: 0.8 }} />
				)}

				<h2 className='text-secondary text-sm'>最新文章</h2>

				{loading ? (
					<div className='flex h-[60px] items-center justify-center'>
						<span className='text-secondary text-xs'>加载中...</span>
					</div>
				) : latestBlogs.length > 0 ? (
					<div className='scroll-container overflow-hidden' style={{ height: 80 }}>
						<div className='scroll-content flex gap-3' style={{ width: 'max-content' }}>
							{[...latestBlogs, ...latestBlogs].map((blog, i) => (
								<Link
									key={`${blog.slug}-${i}`}
									href={`/blog/${blog.slug}`}
									className='flex shrink-0 flex-col flex-shrink-0 rounded-xl border border-transparent bg-white/40 p-2 transition-all hover:border-brand/30 hover:bg-white/60'
									style={{ width: 140 }}>
									{blog.cover ? (
										<img src={blog.cover} alt='cover' className='h-20 w-full rounded-lg border object-cover' />
									) : (
										<div className='text-secondary flex h-20 w-full items-center justify-center rounded-lg bg-white/60 text-xs'>无封面</div>
									)}
									<div className='mt-2'>
										<h3 className='line-clamp-2 text-xs font-medium'>{blog.title || blog.slug}</h3>
										<p className='text-secondary mt-1 text-[10px]'>{dayjs(blog.date).format('YYYY/M/D')}</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				) : (
					<div className='flex h-[60px] items-center justify-center'>
						<span className='text-secondary text-xs'>暂无文章</span>
					</div>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
