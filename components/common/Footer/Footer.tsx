import Link from 'next/link'
import Image from 'next/image'
import ThemeSwitch from '../ThemeSwitch'
import { STRINGS } from '@lib/strings'
import { SITE_LOGO, SITE_LOGO_LIGHT, SITE_NAME } from '@lib/constants'

const Footer = ({ categories, pages }: TNavigation) => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link href="/">
            <a className="site-footer-logo" aria-label={SITE_NAME}>
              <span className="site-footer-logo-light">
                <Image
                  src={SITE_LOGO_LIGHT}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </span>
              <span className="site-footer-logo-dark" aria-hidden="true">
                <Image
                  src={SITE_LOGO}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </span>
              <span className="site-footer-title">{SITE_NAME}</span>
            </a>
          </Link>
          <p className="site-footer-blurb">{STRINGS.footerBlurb}</p>
        </div>

        <div className="site-footer-cols">
          <div className="site-footer-col">
            <h3 className="site-footer-heading">{STRINGS.sections}</h3>
            <nav aria-label={STRINGS.sections}>
              <Link href="/articles">
                <a>{STRINGS.allArticles}</a>
              </Link>
              {categories.map((category) => (
                <Link href={`/${category.slug}`} key={category.slug}>
                  <a>{category.title}</a>
                </Link>
              ))}
            </nav>
          </div>

          <div className="site-footer-col">
            <h3 className="site-footer-heading">{STRINGS.more}</h3>
            <nav aria-label={STRINGS.more}>
              <Link href="/contributors">
                <a>{STRINGS.contributors}</a>
              </Link>
              <Link href="/contact-us">
                <a>{STRINGS.contact}</a>
              </Link>
              {pages.map((page) => (
                <Link href={`/pages/${page.slug}`} key={page.slug}>
                  <a>{page.title}</a>
                </Link>
              ))}
              <a
                href="https://doctor-laser.ir"
                target="_blank"
                rel="noopener noreferrer"
              >
                {STRINGS.clinicManagementSystem}
              </a>
            </nav>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p className="site-footer-copy">
          © {new Date().getFullYear()} {SITE_NAME} — {STRINGS.footerRights}
        </p>
        <ThemeSwitch />
      </div>
    </footer>
  )
}

export default Footer
