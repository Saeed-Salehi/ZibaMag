import Link from 'next/link'
import ThemeSwitch from '../ThemeSwitch'
import s from './Footer.module.css'
import { STRINGS } from '@lib/strings'
import { SITE_NAME } from '@lib/constants'

const Footer = ({ categories, pages }: TNavigation) => {
  return (
    <footer className="block bottom-0 left-0 right-0 bg-primary-05 px-6 py-6 md:px-32 lg:px-48 xl:px-1/5">
      <nav
        className="flex flex-col  mt-6 mb-6 flex-wrap md:flex-row md:justify-between"
        aria-label="Footer Nav"
      >
        <div>
          <h3 className={s.heading}>{STRINGS.sections}</h3>
          <ul className={s.ul}>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/${category.slug}`}>
                  <a className={s.link}>{category.title}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={s.heading}>{STRINGS.more}</h3>
          <ul className={s.ul}>
            <li>
              <Link href="/contributors">
                <a className={s.link}>{STRINGS.contributors}</a>
              </Link>
            </li>
            <li>
              <Link href="/contact-us">
                <a className={s.link}>{STRINGS.contact}</a>
              </Link>
            </li>
            {pages.map((page) => (
              <li key={page.slug}>
                <Link href={`/pages/${page.slug}`}>
                  <a className={s.link}>{page.title}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={s.heading}>{STRINGS.featuredLinks}</h3>
          <ul className={s.ul}>
            <li>
              <a
                href="https://doctor-laser.ir"
                className={s.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {STRINGS.clinicManagementSystem}
              </a>
            </li>
            <li>
              <a
                href="https://pchas.ir"
                className={s.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {STRINGS.developerTeam}
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* <SocialUrls /> */}

      <ThemeSwitch />

      <p className="text-center text-sm text-primary-60 pt-2 pb-1">
        © {SITE_NAME} — {STRINGS.footerRights}
      </p>
    </footer>
  )
}

export default Footer
