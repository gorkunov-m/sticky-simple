// @ts-nocheck
export const debounce = (fn, delay) => {
	let timer
	return () => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(), delay)
	}
}
