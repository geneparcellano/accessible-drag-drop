import { useState, useRef } from 'react'
import './App.scss'

const INITIAL_ITEMS = [
	{ id: 1, label: 'Design system tokens' },
	{ id: 2, label: 'Component library' },
	{ id: 3, label: 'Accessibility audit' },
	{ id: 4, label: 'User testing' },
	{ id: 5, label: 'Documentation' },
]

interface Item {
	id: number
	label: string
}

export default function App() {
	const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
	const [draggingId, setDraggingId] = useState<number | null>(null)
	const [liveMessage, setLiveMessage] = useState<string>('')
	const dragIndex = useRef<number | null>(null)

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
		dragIndex.current = null
		setDraggingId(null)
	}

	function moveItem(index: number, direction: 'up' | 'down') {
		const targetIndex = direction === 'up' ? index - 1 : index + 1
		setItems(prev => {
			const next = [...prev]
			const [moved] = next.splice(index, 1)
			next.splice(targetIndex, 0, moved)
			return next
		})
		setLiveMessage(
			`${items[index].label} moved to position ${targetIndex + 1} of ${items.length}.`
		)
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
		if (e.key === 'ArrowUp') {
			e.preventDefault()
			if (index > 0) moveItem(index, 'up')
		} else if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (index < items.length - 1) moveItem(index, 'down')
		}
	}

	return (
		<main className="app">
			<h1 className="title">Accessible Drag &amp; Drop</h1>
			<p className="subtitle base">Drag items to reorder</p>

			<div role="status" className="sr-only">
				{liveMessage}
			</div>

			<ul className="drag-list" role="list">
				{items.map((item, index) => (
					<li
						key={item.id}
						className={`drag-item base${draggingId === item.id ? ' is-dragging' : ''}`}
						draggable
						onDragStart={() => handleDragStart(index, item.id)}
						onDragEnter={() => handleDragEnter(index)}
						onDragEnd={handleDragEnd}
						onDragOver={e => e.preventDefault()}
					>
						<button
							className="drag-handle-btn"
							aria-label={`Reorder ${item.label}`}
							onKeyDown={e => handleKeyDown(e, index)}
						>
							⠿
						</button>
						<span className="drag-label">{item.label}</span>
						<span className="drag-index base">{index + 1}</span>
					</li>
				))}
			</ul>
		</main>
	)
}
