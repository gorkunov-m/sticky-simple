
export type StickySimpleTarget = HTMLElement | string

export type StickySimpleOptions = {
	marginTop: number
	marginBottom: number
	debug: boolean
	resizeObserver: boolean
}

export type StickySimpleScrollState = {
	scrollTop: number
	direction: 'up' | 'down'
	directionChanged: boolean
}

export type StickySimpleElementState = {
	scrollTop: number
	offsetTop: number
	pinToTopRequired: boolean
	pinToBottomRequired: boolean
	pinned: boolean
}

export type StickySimpleElementParams = {
	active: boolean
	height: number
	scrollTopLimit: number
	scrollBottomLimit: number
}
