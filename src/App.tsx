import { useState, useRef, useEffect } from 'react'
import './App.scss'

interface Item {
	id: number
	label: string
}

const INITIAL_ITEMS: Item[] = [
	{ id: 1, label: 'Design system tokens' },
	{ id: 2, label: 'Component library' },
	{ id: 3, label: 'Accessibility audit' },
	{ id: 4, label: 'User testing' },
	{ id: 5, label: 'Documentation' },
]

const preventDragOver = (e: React.DragEvent) => e.preventDefault()

export default function App() {
	const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
	const [draggingId, setDraggingId] = useState<number | null>(null)
	const [liveMessage, setLiveMessage] = useState<string>('')
	const dragIndex = useRef<number | null>(null)
	const itemsRef = useRef<Item[]>(INITIAL_ITEMS)

	useEffect(() => { itemsRef.current = items }, [items])

	// Capture-phase listener fires before the browser's draggable machinery,
	// fixing arrow key interception on Windows Chrome/Edge.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
			const btn = e.target as HTMLElement
			if (!btn.classList.contains('drag-handle-btn')) return
			const index = parseInt(btn.dataset.index ?? '-1', 10)
			if (index < 0) return
			e.preventDefault()
			e.stopPropagation()
			const current = itemsRef.current
			const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1
			if (targetIndex < 0 || targetIndex >= current.length) return
			const label = current[index].label
			const next = [...current]
			const [moved] = next.splice(index, 1)
			next.splice(targetIndex, 0, moved)
			setItems(next)
			setLiveMessage(`${label} moved to position ${targetIndex + 1} of ${current.length}.`)
		}
		document.addEventListener('keydown', onKeyDown, true)
		return () => document.removeEventListener('keydown', onKeyDown, true)
	}, [])

	function handleDragStart(index: number, id: number) {
		dragIndex.current = index
		setDraggingId(id)
	}

	function handleDragEnter(index: number) {
		if (dragIndex.current === null || dragIndex.current === index) return
		const from = dragIndex.current
		dragIndex.current = index
		setItems(prev => {
			const next = [...prev]
			const [dragged] = next.splice(from, 1)
			next.splice(index, 0, dragged)
			return next
		})
	}

	function handleDragEnd() {
		// Read latest items state via functional updater to avoid stale closure
		setItems(prev => {
			if (draggingId !== null) {
				const index = prev.findIndex(item => item.id === draggingId)
				if (index !== -1) {
					setLiveMessage(`${prev[index].label} moved to position ${index + 1} of ${prev.length}.`)
				}
			}
			return prev
		})
		dragIndex.current = null
		setDraggingId(null)
	}

	return (
		<main className="app">
			<h1 className="title">Accessible Drag &amp; Drop</h1>
			<p className="subtitle base">Drag items to reorder</p>

			<div role="status" aria-atomic="true" className="sr-only">
				{liveMessage}
			</div>

			<p id="reorder-hint" className="sr-only">
				Press Arrow Up or Arrow Down to reorder.
			</p>

			{/* role="list" restores list semantics stripped by list-style:none in Safari/VoiceOver */}
			<ul className="drag-list" role="list">
				{items.map((item, index) => (
					<li
						key={item.id}
						className={`drag-item base${draggingId === item.id ? ' is-dragging' : ''}`}
						draggable
						onDragStart={() => handleDragStart(index, item.id)}
						onDragEnter={() => handleDragEnter(index)}
						onDragEnd={handleDragEnd}
						onDragOver={preventDragOver}
					>
						{/* role="spinbutton" makes screen readers switch to focus mode,
						    so arrow keys reach the app instead of navigating the page */}
						<button
							className="drag-handle-btn"
							data-index={index}
							role="spinbutton"
							aria-label={item.label}
							aria-valuenow={index + 1}
							aria-valuemin={1}
							aria-valuemax={items.length}
							aria-valuetext={`Position ${index + 1} of ${items.length}`}
							aria-describedby="reorder-hint"
						>
							<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
								<rect x="2" y="3" width="12" height="2" rx="1"/>
								<rect x="2" y="7" width="12" height="2" rx="1"/>
								<rect x="2" y="11" width="12" height="2" rx="1"/>
							</svg>
						</button>
						<span className="drag-label">{item.label}</span>
						<span className="drag-index base">{index + 1}</span>
					</li>
				))}
			</ul>
		</main>
	)
}
