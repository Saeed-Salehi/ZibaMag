// Global Data
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zibamag.ir'
export const SITE_NAME = 'زیبا مگ'
/** Relative path under /public — use in next/image and local assets */
export const SITE_LOGO = '/static/images/site-logo.jpeg'
/** Absolute URL — use in JSON-LD / external consumers */
export const SITE_LOGO_URL = `${SITE_URL.replace(/\/$/, '')}${SITE_LOGO}`

export const SOCIAL_USERNAMES = {
  twitter: 'zibamag_',
  instagram: 'zibamag',
  facebook: 'zibamag',
  youtube: null,
  linkedin: 'zibamag',
}

// Default SEO
export const SEO_DESCRIPTION =
  'زیبا مگ؛ مجله آنلاین فارسی با مقالات تخصصی، گزارش‌ها و مطالب به‌روز در حوزه زیبایی، سبک زندگی و فرهنگ. مرجع محتوای باکیفیت برای مخاطبان فارسی‌زبان.'

// Dimensions match public/static/images/site-logo.jpeg (640×640)
export const OG_IMAGE = {
  large: {
    url: SITE_LOGO,
    width: 640,
    height: 640,
  },
}
