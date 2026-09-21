import { Outlet } from 'react-router'
import Contact from './Contact.tsx'
import Navbar from './Navbar.tsx'

export default function Layout() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-mist font-content text-near-black/70 dark:bg-near-black dark:text-mist/70">
      <Navbar />
      <main className="flex w-full flex-1 flex-col px-4 py-8 sm:px-8">
        <Outlet />
      </main>
      <Contact />
    </div>
  )
}
