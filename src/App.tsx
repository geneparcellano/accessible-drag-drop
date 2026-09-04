import { useState, useRef, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
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

function reorder<T>(list: T[], from: number, to: number): T[] {
	const next = [...list]
	const [moved] = next.splice(from, 1)
	next.splice(to, 0, moved)
	return next
}

const positionMessage = (label: string, index: number, total: number) =>
	`${label} moved to position ${index + 1} of ${total}.`

const HANDLE_ICON = (
	<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
		<rect x="2" y="3" width="12" height="2" rx="1"/>
		<rect x="2" y="7" width="12" height="2" rx="1"/>
		<rect x="2" y="11" width="12" height="2" rx="1"/>
	</svg>
)

interface DragItemProps {
	item: Item
	index: number
	total: number
	isDragging: boolean
	onDragStart: (index: number, id: number) => void
	onDragEnter: (index: number) => void
	onDragEnd: () => void
}

function DragItem({ item, index, total, isDragging, onDragStart, onDragEnter, onDragEnd }: DragItemProps) {
	return (
		<li
			className={`drag-item base${isDragging ? ' is-dragging' : ''}`}
			draggable
			// Toggle the class on the DOM node directly, not just via the
			// isDragging prop: Chrome on Windows freezes the actively-dragged
			// node's own paint until drop, so a style change that only takes
			// effect through React's next render can lose the race. Doing it
			// here too means it lands the instant dragstart fires, before
			// that freeze can take hold.
			onDragStart={(e) => {
				e.currentTarget.classList.add('is-dragging')
				onDragStart(index, item.id)
			}}
			onDragEnter={() => onDragEnter(index)}
			onDragEnd={(e) => {
				e.currentTarget.classList.remove('is-dragging')
				onDragEnd()
			}}
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
				aria-valuemax={total}
				aria-valuetext={`Position ${index + 1} of ${total}`}
				aria-describedby="reorder-hint"
			>
				{HANDLE_ICON}
			</button>
			<span className="drag-label">{item.label}</span>
			<span className="drag-index base">{index + 1}</span>
		</li>
	)
}

export default function App() {
	const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
	const [draggingId, setDraggingId] = useState<number | null>(null)
	const [liveMessage, setLiveMessage] = useState<string>('')
	const dragIndex = useRef<number | null>(null)

	// Capture-phase listener fires before the browser's draggable machinery,
	// fixing arrow key interception on Windows Chrome/Edge.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
			if (!(e.target instanceof HTMLElement)) return
			const handle = e.target.closest<HTMLElement>('.drag-handle-btn')
			if (!handle) return
			const index = Number(handle.dataset.index)
			if (!Number.isInteger(index)) return
			e.preventDefault()
			e.stopPropagation()
			const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1
			if (targetIndex < 0 || targetIndex >= items.length) return
			setItems(reorder(items, index, targetIndex))
			setLiveMessage(positionMessage(items[index].label, targetIndex, items.length))
		}
		document.addEventListener('keydown', onKeyDown, true)
		return () => document.removeEventListener('keydown', onKeyDown, true)
	}, [items])

	function handleDragStart(index: number, id: number) {
		dragIndex.current = index
		setDraggingId(id)
	}

	function handleDragEnter(index: number) {
		const from = dragIndex.current
		if (from === null || from === index) return
		dragIndex.current = index
		setItems(prev => reorder(prev, from, index))
	}

	function handleDragEnd() {
		// `items` is the post-drop order: every reorder re-rendered before dragend fires.
		const index = items.findIndex(item => item.id === draggingId)
		if (index !== -1) {
			setLiveMessage(positionMessage(items[index].label, index, items.length))
		}
		dragIndex.current = null
		setDraggingId(null)
	}

	return (
		<main className="app">
			<ThemeToggle />
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
					<DragItem
						key={item.id}
						item={item}
						index={index}
						total={items.length}
						isDragging={draggingId === item.id}
						onDragStart={handleDragStart}
						onDragEnter={handleDragEnter}
						onDragEnd={handleDragEnd}
					/>
				))}
			</ul>
		</main>
	)
}
