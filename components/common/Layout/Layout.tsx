import { useIsOffline } from '@lib/hooks/use-is-offline'
import { useToast } from '@lib/hooks/use-toast'
import { useEffect } from 'react'
import { Footer } from '../Footer'
import { Header } from '../Header'
import { Nav } from '../Nav'
import cn from 'classnames'
import { STRINGS } from '@lib/strings'

type Props = {
  children: React.ReactNode
  navigation?: TNavigation
  isMarkdown?: boolean
}

const Layout = ({ children, navigation, isMarkdown = false }: Props) => {
  const { isOffline } = useIsOffline()
  const { addToast } = useToast()

  useEffect(() => {
    if (isOffline) {
      addToast(STRINGS.noInternet)
    }
  }, [addToast, isOffline])

  const showNav = Boolean(navigation) && !isMarkdown

  return (
    <>
      <Header />
      {showNav && <Nav categories={navigation!.categories} />}

      <main
        className={cn(
          'site-main',
          showNav && 'site-main-with-nav',
          isMarkdown ? 'site-main-reading' : undefined
        )}
      >
        {children}
      </main>

      {navigation && (
        <Footer categories={navigation.categories} pages={navigation.pages} />
      )}
    </>
  )
}

export default Layout
