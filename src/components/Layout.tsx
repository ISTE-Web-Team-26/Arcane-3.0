import { Outlet } from 'react-router'
import Contact from './Contact.tsx'
import Navbar from './Navbar.tsx'

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col border-x border-dark-red/30 bg-mist font-content text-near-black/70 dark:border-dark-red/30 dark:bg-near-black dark:text-mist/70">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-8">
        <Outlet />
      </main>
      <Contact />
    </div>
  )
}
