import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import EventLoading from './components/events/EventLoading.tsx'

// Lazy-load secondary routes — they're never needed on first paint
const Event = lazy(() => import('./pages/Event.tsx'))
const Register = lazy(() => import('./pages/Register.tsx'))
const Admin = lazy(() => import('./pages/Admin.tsx'))
const Event1 = lazy(() => import('./pages/Event1.tsx'))
const Event2 = lazy(() => import('./pages/Event2.tsx'))
const Event3 = lazy(() => import('./pages/Event3.tsx'))
const NotFound = lazy(() => import('./pages/NotFound.tsx'))

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="event1"
            element={
              <Suspense fallback={<EventLoading />}>
                <Event1 />
              </Suspense>
            }
          />
          <Route
            path="event2"
            element={
              <Suspense fallback={<EventLoading />}>
                <Event2 />
              </Suspense>
            }
          />
          <Route
            path="event3"
            element={
              <Suspense fallback={<EventLoading />}>
                <Event3 />
              </Suspense>
            }
          />
          <Route
            path="events/:slug"
            element={
              <Suspense fallback={<EventLoading />}>
                <Event />
              </Suspense>
            }
          />
          <Route
            path="events/:slug/register"
            element={
              <Suspense fallback={<EventLoading />}>
                <Register />
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <Suspense fallback={<EventLoading />}>
                <Admin />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
