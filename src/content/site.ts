export type Locale = 'zh' | 'en'

/** Update this object for every release. Links can be App Store, GitHub Release, or a direct file. */
export const release = {
  version: '1.1.1',
  date: '2026.10.02',
  macDownload: 'https://apps.apple.com/app/id6794372820',
  windowsDownload: '',
  macRequirement: { zh: 'macOS 14.0 或更高版本', en: 'macOS 14.0 or later' },
  windowsRequirement: 'Windows 10 / 11',
  notes: [
    { zh: '修复悬浮 Note 和 Todo 编辑多行内容时的布局问题，卡片现在会随内容向下延伸。', en: 'Fixed multiline editing in floating Notes and Todos so cards now grow downward with their content.' },
    { zh: '原生 macOS 悬浮窗口与卡片内容高度保持同步，标题与操作区域不再被挤压或遮挡。', en: 'Native macOS floating windows now stay synchronized with card content height, keeping headers and controls visible.' },
    { zh: '改进卡片拖拽预览，使预览尺寸和外观与实际卡片保持一致。', en: 'Improved card drag previews so their size and appearance match the actual card.' },
    { zh: '更新品牌文案并优化界面细节与整体稳定性。', en: 'Updated the brand copy and refined interface details and overall stability.' },
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
    zh: {
      notes: '/images/app-store/notes.png',
      floating: '/images/app-store/floating.png',
      tasks: '/images/app-store/tasks.png',
      desktop: '/images/app-store/desktop.png',
      themes: '/images/app-store/themes.png',
      guide: '/images/app-store/guide.png',
    },
    en: {
      notes: '/images/app-store/en/notes.png',
      floating: '/images/app-store/en/floating.png',
      tasks: '/images/app-store/en/tasks.png',
      desktop: '/images/app-store/en/desktop.png',
      themes: '/images/app-store/en/themes.png',
      guide: '/images/app-store/en/guide.png',
    },
  },
}
