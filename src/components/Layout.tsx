import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Contact from './Contact.tsx'
import Navbar from './Navbar.tsx'

function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document
        .querySelector(hash)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, hash])

  return null
}

export default function Layout() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-mist font-content text-near-black/70 dark:bg-near-black dark:text-mist/70">
      <Navbar />
      <main className="flex w-full flex-1 flex-col px-4 py-8 sm:px-8">
        <ScrollToHash />
        <Outlet />
      </main>
      <Contact />
    </div>
  )
}
