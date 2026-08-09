import type { OptimizedImageAsset } from '../content/rootMedia'

function image(src: string, thumbnail: string, fallback: string): OptimizedImageAsset {
  return { src, thumbnail, fallback }
}

export const homeImages: Record<string, OptimizedImageAsset> = {
  '/images/home-hero-floatem-workspaces.png': image(new URL('../../resources/optimized/images/home-hero-floatem-workspaces.webp', import.meta.url).href, new URL('../../resources/optimized/images/home-hero-floatem-workspaces-thumb.webp', import.meta.url).href, '/images/home-hero-floatem-workspaces.png'),
  '/images/01-经典色.png': image(new URL('../../resources/optimized/images/01-经典色.webp', import.meta.url).href, new URL('../../resources/optimized/images/01-经典色-thumb.webp', import.meta.url).href, '/images/01-经典色.png'),
  '/images/02-浮光.png': image(new URL('../../resources/optimized/images/02-浮光.webp', import.meta.url).href, new URL('../../resources/optimized/images/02-浮光-thumb.webp', import.meta.url).href, '/images/02-浮光.png'),
  '/images/03-梅.png': image(new URL('../../resources/optimized/images/03-梅.webp', import.meta.url).href, new URL('../../resources/optimized/images/03-梅-thumb.webp', import.meta.url).href, '/images/03-梅.png'),
  '/images/04-兰.png': image(new URL('../../resources/optimized/images/04-兰.webp', import.meta.url).href, new URL('../../resources/optimized/images/04-兰-thumb.webp', import.meta.url).href, '/images/04-兰.png'),
  '/images/05-竹.png': image(new URL('../../resources/optimized/images/05-竹.webp', import.meta.url).href, new URL('../../resources/optimized/images/05-竹-thumb.webp', import.meta.url).href, '/images/05-竹.png'),
  '/images/06-菊.png': image(new URL('../../resources/optimized/images/06-菊.webp', import.meta.url).href, new URL('../../resources/optimized/images/06-菊-thumb.webp', import.meta.url).href, '/images/06-菊.png'),
  '/images/07-悬浮主窗口-视频工作.png': image(new URL('../../resources/optimized/images/07-悬浮主窗口-视频工作.webp', import.meta.url).href, new URL('../../resources/optimized/images/07-悬浮主窗口-视频工作-thumb.webp', import.meta.url).href, '/images/07-悬浮主窗口-视频工作.png'),
  '/images/08-多卡片悬浮-代码工作.png': image(new URL('../../resources/optimized/images/08-多卡片悬浮-代码工作.webp', import.meta.url).href, new URL('../../resources/optimized/images/08-多卡片悬浮-代码工作-thumb.webp', import.meta.url).href, '/images/08-多卡片悬浮-代码工作.png'),
  '/images/09-桌面固定-彩色便签.png': image(new URL('../../resources/optimized/images/09-桌面固定-彩色便签.webp', import.meta.url).href, new URL('../../resources/optimized/images/09-桌面固定-彩色便签-thumb.webp', import.meta.url).href, '/images/09-桌面固定-彩色便签.png'),
  '/images/10-待办与提醒.png': image(new URL('../../resources/optimized/images/10-待办与提醒.webp', import.meta.url).href, new URL('../../resources/optimized/images/10-待办与提醒-thumb.webp', import.meta.url).href, '/images/10-待办与提醒.png'),
}
