'use client'

import Card from '@/components/card'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import ScrollOutlineSVG from '@/svgs/scroll-outline.svg'
import ScrollFilledSVG from '@/svgs/scroll-filled.svg'
import ProjectsFilledSVG from '@/svgs/projects-filled.svg'
import ProjectsOutlineSVG from '@/svgs/projects-outline.svg'
import AboutFilledSVG from '@/svgs/about-filled.svg'
import AboutOutlineSVG from '@/svgs/about-outline.svg'
import ShareFilledSVG from '@/svgs/share-filled.svg'
import ShareOutlineSVG from '@/svgs/share-outline.svg'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'
import { PasswordDialog } from '@/components/password-dialog'

const list = [
	{
		icon: ScrollOutlineSVG,
		iconActive: ScrollFilledSVG,
		label: '笔记',
		href: '/blog',
		key: 'blog'
	},
	{
		icon: ProjectsOutlineSVG,
		iconActive: ProjectsFilledSVG,
		label: '项目',
		href: '/projects',
		key: 'projects'
	},
	{
		icon: ShareOutlineSVG,
		iconActive: ShareFilledSVG,
		label: '收藏',
		href: '/share',
		key: 'share'
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于',
		href: '/about',
		key: 'about'
	},
]

const extraSize = 8

export default function NavCard() {
	const pathname = usePathname()
	const router = useRouter()
	const center = useCenterStore()
	const [show, setShow] = useState(false)
	const { maxSM } = useSize()
	const [hoveredIndex, setHoveredIndex] = useState<number>(0)
	const [pendingHref, setPendingHref] = useState<string | null>(null)
	const { siteContent, cardStyles } = useConfigStore()
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard

	const protection = siteContent.passwordProtection

	const activeIndex = useMemo(() => {
		const index = list.findIndex(item => pathname === item.href)
		return index >= 0 ? index : undefined
	}, [pathname])

	useEffect(() => {
		setShow(true)
	}, [])

	let form = useMemo(() => {
		if (pathname == '/') return 'full'
		else if (pathname == '/write') return 'mini'
		else return 'icons'
	}, [pathname])
	if (maxSM) form = 'icons'

	const itemHeight = form === 'full' ? 52 : 28

	let position = useMemo(() => {
		if (form === 'full') {
			const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - hiCardStyles.width / 2 - styles.width - CARD_SPACING
			const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 - styles.height
			return { x, y }
		}

		return {
			x: 24,
			y: 16
		}
	}, [form, center, styles, hiCardStyles])

	const size = useMemo(() => {
		if (form === 'mini') return { width: 64, height: 64 }
		else if (form === 'icons') return { width: 340, height: 64 }
		else return { width: styles.width, height: styles.height }
	}, [form, styles])

	useEffect(() => {
		if (form === 'icons' && activeIndex !== undefined && hoveredIndex !== activeIndex) {
			const timer = setTimeout(() => {
				setHoveredIndex(activeIndex)
			}, 1500)
			return () => clearTimeout(timer)
		}
	}, [hoveredIndex, activeIndex, form])

	const handleItemClick = (item: (typeof list)[number]) => {
		if (protection?.enabled && protection.items?.includes(item.key) && protection.password) {
			setPendingHref(item.href)
		} else {
			router.push(item.href)
		}
	}

	// Left sidebar for all pages (always visible alongside other nav forms)
	const showLeftSidebar = true

	const handlePasswordSuccess = () => {
		if (pendingHref) {
			router.push(pendingHref)
			setPendingHref(null)
		}
	}

	// Left sidebar mode
	if (showLeftSidebar && show) {
		return (
			<>
				<PasswordDialog
					open={pendingHref !== null}
					password={protection?.password || ''}
					onSuccess={handlePasswordSuccess}
					onCancel={() => setPendingHref(null)}
				/>
				<nav
					className='fixed left-0 top-1/2 -translate-y-1/2 z-50 flex h-auto w-16 flex-col items-center gap-3 border-r border-border/50 bg-background/80 backdrop-blur-sm py-4'
					aria-label='站内外导航'
				>
				{/* Logo */}
				<Link href='/' className='mb-6 flex flex-col items-center gap-1'>
					<Image src='/images/avatar.png' alt='avatar' width={36} height={36} className='rounded-full' style={{ boxShadow: '0 8px 16px -4px rgba(0,0,0,0.15)' }} />
				</Link>

				{/* Nav items */}
				<div className='relative flex flex-1 flex-col gap-3'>
					<motion.div
						className='absolute left-1.5 rounded-full border border-border/60 bg-card'
						layoutId='nav-hover'
						initial={false}
						animate={{ top: hoveredIndex * 56, left: 0, width: 'calc(100% - 12px)', height: 48 }}
						transition={{ type: 'spring', stiffness: 400, damping: 30 }}
					/>
					{list.map((item, index) => (
						<button
							key={item.href}
							onClick={() => handleItemClick(item)}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(activeIndex ?? 0)}
							className={cn(
								'relative z-10 flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full transition-colors cursor-pointer',
								activeIndex === index ? 'text-primary' : 'text-secondary hover:text-primary'
							)}
						>
							{activeIndex === index
								? <item.iconActive className='h-6 w-6' />
								: <item.icon className='h-6 w-6' />}
							<span className='text-[9px] font-medium leading-none'>{item.label}</span>
						</button>
					))}
				</div>
			</nav>
			</>
		)
	}

	if (maxSM) position = { x: center.x - size.width / 2, y: 16 }

	if (show && form !== 'full')
		return (
			<>
				<PasswordDialog
					open={pendingHref !== null}
					password={protection?.password || ''}
					onSuccess={handlePasswordSuccess}
					onCancel={() => setPendingHref(null)}
				/>
				<HomeDraggableLayer cardKey='navCard' x={position.x} y={position.y} width={styles.width} height={styles.height}>
					<Card
						order={styles.order}
						width={size.width}
						height={size.height}
						x={position.x}
						y={position.y}
						className={clsx(form != 'full' && 'overflow-hidden', form === 'mini' && 'p-3', form === 'icons' && 'flex items-center gap-6 p-3')}>
						{form === 'full' && siteContent.enableChristmas && (
							<>
								<img
									src='/images/christmas/snow-4.webp'
									alt='Christmas decoration'
									className='pointer-events-none absolute'
									style={{ width: 160, left: -18, top: -20, opacity: 0.9 }}
								/>
							</>
						)}

						<Link className='flex items-center gap-3' href='/'>
							<Image src='/images/avatar.png' alt='avatar' width={40} height={40} style={{ boxShadow: ' 0 12px 20px -5px #E2D9CE' }} className='rounded-full' />
							{form === 'full' && <span className='font-averia mt-1 text-2xl leading-none font-medium'>{siteContent.meta.title}</span>}
							{form === 'full' && <span className='text-brand mt-2 text-xs font-medium'>(躺平中)</span>}
						</Link>

						{(form === 'full' || form === 'icons') && (
							<>
								{form !== 'icons' && <div className='text-secondary mt-6 text-sm uppercase'>General</div>}

								<div className={cn('relative mt-2 space-y-2', form === 'icons' && 'mt-0 flex items-center gap-6 space-y-0')}>
									<motion.div
										className='absolute max-w-[230px] rounded-full border'
										layoutId='nav-hover'
										initial={false}
										animate={
											form === 'icons'
												? {
														left: hoveredIndex * (itemHeight + 24) - extraSize,
														top: -extraSize,
														width: itemHeight + extraSize * 2,
														height: itemHeight + extraSize * 2
													}
												: { top: hoveredIndex * (itemHeight + 8), left: 0, width: '100%', height: itemHeight }
										}
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 30
										}}
										style={{ backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)' }}
									/>

									{list.map((item, index) => (
										<button
											key={item.href}
											onClick={() => handleItemClick(item)}
											className={cn('text-secondary text-md relative z-10 flex items-center gap-3 rounded-full px-5 py-3', form === 'icons' && 'p-0 w-full')}>
											<div className='flex h-7 w-7 items-center justify-center'>
												{hoveredIndex == index ? <item.iconActive className='text-brand absolute h-7 w-7' /> : <item.icon className='absolute h-7 w-7' />}
											</div>
											{form !== 'icons' && <span className={clsx(index == hoveredIndex && 'text-primary font-medium')}>{item.label}</span>}
										</button>
									))}
								</div>
							</>
						)}
					</Card>
				</HomeDraggableLayer>
			</>
		)
}
