'use client'

import type { SiteContent } from '../../stores/config-store'

interface BeianFormProps {
  formData: SiteContent
  setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
}

export function BeianForm({ formData, setFormData }: BeianFormProps) {
  // 通用更新函数
  const updateBeian = (
    type: 'icp' | 'publicSecurity',
    field: 'text' | 'link' | 'icon',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      beian: {
        ...(prev.beian || {}),
        [type]: {
          ...(prev.beian?.[type] || { text: '', link: '', icon: '' }),
          [field]: value,
        },
      },
    }))
  }

  // 兼容旧数据
  const icp = formData.beian?.icp || { text: '', link: '', icon: '' }
  const publicSecurity = formData.beian?.publicSecurity || { text: '', link: '', icon: '' }

  return (
    <div className='space-y-6'>
      {/* ICP备案 */}
      <div className='space-y-2'>
        <label className='mb-2 block text-sm font-medium'>ICP备案信息</label>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          <div>
            <label className='mb-1 block text-xs text-gray-600'>备案号</label>
            <input
              type='text'
              value={icp.text}
              onChange={e => updateBeian('icp', 'text', e.target.value)}
              placeholder='鄂ICP备12345678号-1'
              className='bg-secondary/10 w-full rounded-lg border px-4 py-2 text-base'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-gray-600'>备案链接(可选)</label>
            <input
              type='url'
              value={icp.link}
              onChange={e => updateBeian('icp', 'link', e.target.value)}
              placeholder='https://beian.miit.gov.cn/'
              className='bg-secondary/10 w-full rounded-lg border px-4 py-2 text-sm'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-gray-600'>图标路径(可选)</label>
            <input
              type='text'
              value={icp.icon}
              onChange={e => updateBeian('icp', 'icon', e.target.value)}
              placeholder='/images/beian/icp.png'
              className='bg-secondary/10 w-full rounded-lg border px-4 py-2 text-sm'
            />
          </div>
        </div>
      </div>

      {/* 公安备案 */}
      <div className='space-y-2'>
        <label className='mb-2 block text-sm font-medium'>公安备案信息</label>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          <div>
            <label className='mb-1 block text-xs text-gray-600'>备案号</label>
            <input
              type='text'
              value={publicSecurity.text}
              onChange={e => updateBeian('publicSecurity', 'text', e.target.value)}
              placeholder='鄂公网安备1234567890123号'
              className='bg-secondary/10 w-full rounded-lg border px-4 py-2 text-base'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-gray-600'>备案链接(可选)</label>
            <input
              type='url'
              value={publicSecurity.link}
              onChange={e => updateBeian('publicSecurity', 'link', e.target.value)}
              placeholder='http://www.beian.gov.cn/'
              className='bg-secondary/10 w-full rounded-lg border px-4 py-2 text-sm'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-gray-600'>图标路径(可选)</label>
            <input
              type='text'
              value={publicSecurity.icon}
              onChange={e => updateBeian('publicSecurity', 'icon', e.target.value)}
              placeholder='/images/beian/public-security.png'
              className='bg-secondary/10 w-full rounded-lg border px-4 py-2 text-sm'
            />
          </div>
        </div>
      </div>

      {/* 备案信息预览区域 */}
      <div className='border rounded-lg p-4 bg-secondary/5'>
        <h3 className='font-medium mb-3 text-sm'>备案信息预览</h3>
        <div className='flex items-center gap-2'>
          {/* ICP备案号 */}
          {icp.text && (
            <a 
              href={icp.link || 'https://beian.miit.gov.cn/'} 
              target='_blank' 
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'
            >
              {icp.text}
            </a>
          )}
          
          {/* 公安备案图标 (作为分隔符) */}
          {publicSecurity.icon && (
            <img 
              src={publicSecurity.icon} 
              alt="公安备案图标" 
              className="h-4 w-auto"
            />
          )}
          
          {/* 公安备案号 */}
          {publicSecurity.text && (
            <a 
              href={publicSecurity.link || 'http://www.beian.gov.cn/'} 
              target='_blank' 
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'
            >
              {publicSecurity.text}
            </a>
          )}
        </div>
        
        {/* 无数据提示 */}
        {!icp.text && !publicSecurity.text && (
          <div className='text-gray-500 text-sm italic'>
            输入备案信息后将在此处显示预览
          </div>
        )}
      </div>
    </div>
  )
}
