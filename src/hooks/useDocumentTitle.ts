import { useEffect } from 'react'

/** Keep the browser tab title in sync with the current page. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
