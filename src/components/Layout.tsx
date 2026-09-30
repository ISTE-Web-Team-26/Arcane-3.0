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
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <div className="relative flex min-h-svh w-full flex-col bg-near-black font-content text-mist antialiased">
      {isAdmin ? null : <Navbar />}
      <main className="flex w-full flex-1 flex-col px-4 pt-[4.5rem] pb-8 sm:px-8 sm:pt-[5rem]">
        <ScrollToHash />
        <Outlet />
      </main>
      {isAdmin ? null : <Contact />}
    </div>
  )
}
