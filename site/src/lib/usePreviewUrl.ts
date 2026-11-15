import { useEffect, useMemo } from 'react'

/** Object URL for previewing a picked file; revoked when the file changes or the component unmounts. */
export function usePreviewUrl(file: File | undefined) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])
  return url
}
