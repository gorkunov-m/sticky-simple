import { RESIZE_OBSERVER_DEBOUNCE_DELAY } from './constants'
import {
	StickySimpleElementParams,
	StickySimpleElementState,
	StickySimpleOptions,
	StickySimpleScrollState,
	StickySimpleTarget
} from './types'
import { debounce } from './utils'

export class StickySimple {
	private stickyElement: HTMLElement

	private options: StickySimpleOptions = {
		marginTop: 0,
		marginBottom: 0,
		debug: false,
		resizeObserver: true,
	}

	private scrollState: StickySimpleScrollState = {
		scrollTop: 0,
		direction: 'down',
		directionChanged: false,
	}

	private elementState: StickySimpleElementState = {
		scrollTop: 0,
		offsetTop: 0,
		pinToTopRequired: false,
		pinToBottomRequired: false,
		pinned: false,
	}

	private elementParams: StickySimpleElementParams = {
		height: 0,
		scrollTopLimit: 0,
		scrollBottomLimit: 0,
		active: false,
	}

	private resizeObserver: ResizeObserver | null = null

	private bindedScrollHandler = () => this.handleScroll()
	private bindedResizeHandler = () => this.handleResize()

	constructor(
		target: StickySimpleTarget,
		options: Partial<StickySimpleOptions> = {},
	) {
		const stickyElement = typeof target === 'string'
			? document.querySelector<HTMLElement>(target)
			: target

		if (stickyElement instanceof HTMLElement !== true) {
			throw new Error('ElementNotFound')
		}

		this.stickyElement = stickyElement
		this.options = Object.assign(this.options, options)

		if (this.options.resizeObserver) {
			this.resizeObserver = new ResizeObserver(debounce(() => {
				this.setInitialState()
			}, RESIZE_OBSERVER_DEBOUNCE_DELAY))
			this.resizeObserver.observe(this.stickyElement)
		} else {
			this.setInitialState()
		}

		window.addEventListener('scroll', this.bindedScrollHandler)
		window.addEventListener('resize', this.bindedResizeHandler)
	}

	private setInitialState() {
		this.setElementParams()
		this.updateState()
	}

	private setElementParams() {
		const stickyElementHeight = this.stickyElement.clientHeight
		const windowHeight = window.innerHeight

		const {
			marginTop,
			marginBottom,
		} = this.options

		this.elementParams = {
			height: stickyElementHeight,
			scrollTopLimit: marginTop,
			scrollBottomLimit: windowHeight - stickyElementHeight - marginBottom,
			active: stickyElementHeight > windowHeight,
		}
	}

	private setElementStyle(style: Record<string, string>) {
		const rules = Object.entries(style)
		const value = rules.map((rule) => rule.join(': ')).join(';')

		this.stickyElement.setAttribute('style', value)
	}

	private log() {
		if (this.options.debug) {
			console.log(JSON.stringify({
				elementParams: this.elementParams,
				elementState: this.elementState,
				scrollState: this.scrollState,
			}, null, 2))
		}
	}

	private updateScrollState() {
		const scrollTop = window.scrollY
		const direction = this.scrollState.scrollTop >= scrollTop ? 'up' : 'down'
		const directionChanged = this.scrollState.direction !== direction

		this.scrollState.direction = direction
		this.scrollState.directionChanged = directionChanged
		this.scrollState.scrollTop = scrollTop
	}

	private updateElementState() {
		const { top } = this.stickyElement.getBoundingClientRect()
		const { offsetTop } = this.stickyElement
		const { direction } = this.scrollState

		const {
			scrollTopLimit,
			scrollBottomLimit,
		} = this.elementParams

		this.elementState.scrollTop = top
		this.elementState.offsetTop = offsetTop
		this.elementState.pinToTopRequired = direction === 'up' && scrollTopLimit < top
		this.elementState.pinToBottomRequired = direction === 'down' && scrollBottomLimit >= top
	}

	private pinElementToTop() {
		this.setElementStyle({
			position: 'sticky',
			top: `${this.options.marginTop}px`,
		})
		this.elementState.pinned = true
	}

	private pinElementToBottom() {
		this.setElementStyle({
			position: 'sticky',
			top: `calc((${this.elementParams.height}px - 100vh) * -1 - ${this.options.marginBottom}px)`,
		})
		this.elementState.pinned = true
	}

	private unpinElement() {
		this.setElementStyle({
			position: 'relative',
			top: `${this.elementState.offsetTop}px`,
		})
		this.elementState.pinned = false
	}

	private updateState() {
		if (!this.elementParams.active) {
			this.pinElementToTop()
			return
		}

		this.updateScrollState()
		this.updateElementState()
		this.log()

		if (this.scrollState.directionChanged && this.elementState.pinned) {
			this.unpinElement()
		}

		if (this.elementState.pinToTopRequired) {
			this.pinElementToTop()
		}

		if (this.elementState.pinToBottomRequired) {
			this.pinElementToBottom()
		}
	}

	private recalc() {
		this.setElementParams()
		this.stickyElement.scrollTo({
			top: this.elementState.offsetTop,
		})
	}

	private handleScroll() {
		this.updateState()
	}

	private handleResize() {
		this.recalc()
	}

	destroy() {
		window.removeEventListener('scroll', this.bindedScrollHandler)
		window.removeEventListener('resize', this.bindedResizeHandler)

		if (this.resizeObserver) {
			this.resizeObserver.disconnect()
		}
	}
}
