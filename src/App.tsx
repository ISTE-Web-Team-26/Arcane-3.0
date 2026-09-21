import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout.tsx'
import Event1 from './pages/Event1.tsx'
import Event2 from './pages/Event2.tsx'
import Event3 from './pages/Event3.tsx'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="event1" element={<Event1 />} />
          <Route path="event2" element={<Event2 />} />
          <Route path="event3" element={<Event3 />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
