export type Locale = 'zh' | 'en'

/** Update this object for every release. Links can be App Store, GitHub Release, or a direct file. */
export const release = {
  version: '1.0.8',
  date: '2026.08.07',
  macDownload: 'https://apps.apple.com/app/id6794372820',
  windowsDownload: '',
  macRequirement: { zh: 'macOS 14.0 或更高版本', en: 'macOS 14.0 or later' },
  windowsRequirement: 'Windows 10 / 11',
  notes: [
    { zh: '全新的引导式教程，让第一次相遇自然发生。', en: 'A guided first-run experience for a gentler beginning.' },
    { zh: '优化多卡片悬浮时的专注体验。', en: 'A more focused experience when several cards are floating.' },
    { zh: '修复若干细微而重要的交互问题。', en: 'A collection of small but meaningful interaction fixes.' },
  ],
}

export const support = { email: 'floatemapp@outlook.com' }

export const themes = [
  { id: 'classic', zh: '经典色', en: 'Classic', color: '#e59a6d', deep: '#39241c', image: '/images/01-经典色.png' },
  { id: 'glow', zh: '浮光', en: 'Afterglow', color: '#eccb96', deep: '#554431', image: '/images/02-浮光.png' },
  { id: 'plum', zh: '梅', en: 'Plum', color: '#c9647c', deep: '#47232d', image: '/images/03-梅.png' },
  { id: 'orchid', zh: '兰', en: 'Orchid', color: '#879dd2', deep: '#26334e', image: '/images/04-兰.png' },
  { id: 'bamboo', zh: '竹', en: 'Bamboo', color: '#7eab8b', deep: '#22392f', image: '/images/05-竹.png' },
  { id: 'chrysanthemum', zh: '菊', en: 'Chrysanthemum', color: '#d6b64f', deep: '#4a3a19', image: '/images/06-菊.png' },
]

export const screenshots = {
  homeHero: '/images/home-hero-floatem-workspaces.png',
  video: '/images/07-悬浮主窗口-视频工作.png',
  code: '/images/08-多卡片悬浮-代码工作.png',
  desktop: '/images/09-桌面固定-彩色便签.png',
  todo: '/images/10-待办与提醒.png',
  appStore: {
    notes: '/images/app-store/notes.png',
    floating: '/images/app-store/floating.png',
    tasks: '/images/app-store/tasks.png',
    desktop: '/images/app-store/desktop.png',
    themes: '/images/app-store/themes.png',
    guide: '/images/app-store/guide.png',
  },
}
