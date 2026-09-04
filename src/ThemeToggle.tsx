import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

// localStorage throws in Safari private mode, so every access is guarded.
function readStoredTheme(): Theme | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored === 'light' || stored === 'dark' ? stored : null
	} catch {
		return null
	}
}

function storeTheme(theme: Theme | null) {
	try {
		if (theme) localStorage.setItem(STORAGE_KEY, theme)
		else localStorage.removeItem(STORAGE_KEY)
	} catch {
		/* preference simply won't persist */
	}
}

const SUN_ICON = (
	<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
		stroke="currentColor" strokeWidth="2" strokeLinecap="round">
		<circle cx="12" cy="12" r="4"/>
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
	</svg>
)

const MOON_ICON = (
	<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
		stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
	</svg>
)

export default function ThemeToggle() {
	// null means "follow the OS", so an untouched page keeps tracking it live.
	const [theme, setTheme] = useState<Theme | null>(readStoredTheme)
	const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

	useEffect(() => {
		const query = window.matchMedia(DARK_QUERY)
		const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
		query.addEventListener('change', onChange)
		return () => query.removeEventListener('change', onChange)
	}, [])

	useEffect(() => {
		if (theme) document.documentElement.dataset.theme = theme
		else delete document.documentElement.dataset.theme
		storeTheme(theme)
	}, [theme])

	const resolved: Theme = theme ?? (systemDark ? 'dark' : 'light')
	const next: Theme = resolved === 'dark' ? 'light' : 'dark'

	return (
		<button
			type="button"
			className="theme-toggle"
			onClick={() => setTheme(next)}
			aria-label={`Switch to ${next} theme`}
			title={`Switch to ${next} theme`}
		>
			{resolved === 'dark' ? SUN_ICON : MOON_ICON}
		</button>
	)
}
