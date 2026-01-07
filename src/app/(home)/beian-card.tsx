import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function BeianCard() {
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const styles = cardStyles.beianCard
  const hiCardStyles = cardStyles.hiCard
  const articleCardStyles = cardStyles.articleCard

  const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - styles.width + 200
  const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING + 180

  // 获取新结构的备案数据
  const beian = siteContent.beian || {}
  const icp = beian.icp || { text: '', link: '' }
  const publicSecurity = beian.publicSecurity || { text: '', link: '', icon: '' }

  // 检查是否有有效的备案信息
  const hasValidBeian = (icp.text && icp.text.trim() !== '') || 
                        (publicSecurity.text && publicSecurity.text.trim() !== '')

  // 如果没有有效备案信息，不渲染卡片
  if (!hasValidBeian) {
    return null
  }

  return (
    <HomeDraggableLayer cardKey='beianCard' x={x} y={y} width={styles.width} height={styles.height}>
      <Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex items-center justify-center max-sm:static'>
        <div className="flex items-center justify-center gap-1.5 w-full px-2">
          {/* ICP备案号 */}
          {icp.text && (
            <Link 
              href={icp.link || 'https://beian.miit.gov.cn/'} 
              target='_blank' 
              rel='noopener noreferrer'
              className='text-black text-sm hover:underline transition-colors'
            >
              {icp.text}
            </Link>
          )}
          
          {/* 公安备案图标 (作为分隔符) - 仅当两边都有内容时显示 */}
          {icp.text && publicSecurity.text && publicSecurity.icon && (
            <img 
              src={publicSecurity.icon} 
              alt="公安备案图标" 
              className="h-3.5 w-auto"
            />
          )}
          
          {/* 公安备案号 */}
          {publicSecurity.text && (
            <Link 
              href={publicSecurity.link || 'http://www.beian.gov.cn/'} 
              target='_blank' 
              rel='noopener noreferrer'
              className='text-black text-sm hover:underline transition-colors'
            >
              {publicSecurity.text}
            </Link>
          )}
        </div>
      </Card>
    </HomeDraggableLayer>
  )
}
