export type Locale = 'zh' | 'en'

/** Update this object for every release. Links can be App Store, GitHub Release, or a direct file. */
export const release = {
  version: '1.1.0',
  date: '2026.09.28',
  macDownload: 'https://apps.apple.com/app/id6794372820',
  windowsDownload: '',
  macRequirement: { zh: 'macOS 14.0 或更高版本', en: 'macOS 14.0 or later' },
  windowsRequirement: 'Windows 10 / 11',
  notes: [
    { zh: 'Floatem 现在常驻菜单栏且不占用 Dock；可随时显示、隐藏、重新加载或退出。', en: 'Floatem now lives in the menu bar without occupying the Dock, with Show, Hide, Reload, and Quit always available.' },
    { zh: '后台快捷键服务会自动修复旧注册；应用被移除后会释放快捷键并退出。', en: 'The background shortcut service now repairs stale registrations and releases its shortcut when the app is removed.' },
    { zh: '复制和粘贴便签内容时会保留受支持的粗体、斜体、下划线与文字颜色。', en: 'Note copy and paste now preserve supported bold, italic, underline, and text-color formatting.' },
    { zh: '长文本获得焦点时，富文本工具栏保持稳定；应用内指引也已完整更新。', en: 'The rich-text toolbar stays stable when long notes gain focus, and the in-app guidance now reflects every current workflow.' },
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
