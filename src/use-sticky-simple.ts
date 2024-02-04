import { StickySimple } from "./sticky-simple"
import { StickySimpleOptions, StickySimpleTarget } from "./types"

export const useStickySimple = (
	target: StickySimpleTarget,
	options?: Partial<StickySimpleOptions>,
) => {
	return new StickySimple(target, options)
}
