((window, document) =>
{
	'use strict'

	const SVG_NS = 'http://www.w3.org/2000/svg'

	const FLAKES = {
		far: { share: 0.55, size: [2, 3.5], opacity: [0.25, 0.5], duration: [16, 26], drift: 30, sway: null },
		mid: { share: 0.3, size: [3.5, 6], opacity: [0.45, 0.8], duration: [11, 17], drift: 20, sway: [8, 20] },
		near: { share: 0.15, size: [11, 17], opacity: [0.3, 0.6], duration: [9, 14], drift: 20, sway: [14, 30] },
	}

	const CAP_PROFILES = [
		t => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 1.4),
		t => Math.pow(Math.sin(Math.PI * Math.pow(t, 1.7)), 1.4),
		t => Math.pow(Math.sin(Math.PI * t), 1.2),
		t => 0.55 * Math.pow(Math.sin(Math.PI * t), 0.8) + 0.45 * Math.pow(Math.sin(Math.PI * t * 2), 2),
		t => 0.5 * Math.pow(Math.sin(Math.PI * t), 0.5) + 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(t, 2.4)), 3),
	]

	let capIndex = 0

	const between = (min, max, random = Math.random) => min + random() * (max - min)

	const pad = value => String(value).padStart(2, '0')

	const createRandom = seed =>
	{
		let state = seed | 0

		return () =>
		{
			state = state + 0x6D2B79F5 | 0
			let value = Math.imul(state ^ state >>> 15, 1 | state)
			value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value
			return ((value ^ value >>> 14) >>> 0) / 4294967296
		}
	}

	const createSvg = (name, attributes) =>
	{
		const element = document.createElementNS(SVG_NS, name)
		for (const [key, value] of Object.entries(attributes))
		{
			element.setAttribute(key, value)
		}
		return element
	}

	const createCap = (random, length, maxHeight) =>
	{
		const lip = Math.max(3, maxHeight * 0.3)
		const base = maxHeight + 1
		const height = (base + lip).toFixed(1)
		const profile = CAP_PROFILES[Math.floor(random() * CAP_PROFILES.length)]
		const lumpCount = Math.max(4, Math.round(length / (maxHeight * 1.05)))
		const spacing = length / lumpCount
		const id = 'ntNewYearCap' + (++capIndex)

		const svg = createSvg('svg', { class: 'ntNewYear-cap', width: length, height, viewBox: `0 0 ${length} ${height}` })
		const defs = createSvg('defs', {})
		const gradient = createSvg('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: height })
		const clip = createSvg('clipPath', { id: id + 'Clip' })
		const shape = createSvg('g', { fill: `url(#${id})` })
		const lumps = createSvg('g', { 'clip-path': `url(#${id}Clip)` })

		gradient.append(
			createSvg('stop', { offset: 0.3, class: 'ntNewYear-capTop' }),
			createSvg('stop', { offset: 1, class: 'ntNewYear-capBottom' })
		)
		clip.append(createSvg('rect', { x: 0, y: 0, width: length, height: base + 0.5 }))
		defs.append(gradient, clip)

		for (let i = 0; i < lumpCount; i++)
		{
			const position = (i + 0.5) / lumpCount
			const fromEdge = Math.min(i, lumpCount - 1 - i)
			const taper = fromEdge === 0 ? 0.42 : (fromEdge === 1 ? 0.74 : 1)
			const sink = fromEdge === 0 ? 0.66 : (fromEdge === 1 ? 0.52 : 0.4)
			const stretch = fromEdge === 0 ? 1.9 : (fromEdge === 1 ? 1.3 : 1)

			const visible = maxHeight * (0.38 + 0.62 * profile(position)) * between(0.78, 1, random) * taper
			const radiusY = visible / (1 - sink)
			const radiusX = Math.max(radiusY * between(1.05, 1.4, random), spacing * 0.72) * stretch
			const reach = radiusX * Math.sqrt(1 - sink * sink)
			const center = Math.min(length - reach - 1, Math.max(reach + 1, position * length + between(-2, 2, random)))

			lumps.append(createSvg('ellipse', {
				cx: center.toFixed(1),
				cy: (base + radiusY * sink).toFixed(1),
				rx: radiusX.toFixed(1),
				ry: radiusY.toFixed(1),
			}))
		}
		shape.append(lumps)

		const dripCount = length > 70 ? Math.floor(random() * 3) : 0
		for (let i = 0; i < dripCount; i++)
		{
			const radiusX = lip * between(0.8, 1.5, random)
			const radiusY = lip * between(0.55, 0.95, random)

			shape.append(createSvg('ellipse', {
				cx: (between(0.22, 0.78, random) * length).toFixed(1),
				cy: (base + radiusY * 0.2).toFixed(1),
				rx: radiusX.toFixed(1),
				ry: radiusY.toFixed(1),
			}))
		}

		svg.append(defs, shape)

		return { svg, lip }
	}

	XF.NtNewYear = XF.Element.newHandler({
		options: {
			snowCount: 60,
			caps: false,
			capTargets: '.block--category .block-container, .p-body-sidebar .block-container, .button--cta',
			capLimit: 24,
		},

		snow: null,
		reducedMotion: null,
		resizeTimer: null,
		lastWidth: 0,
		capped: null,

		init ()
		{
			this.snow = this.target.querySelector('.js-ntNewYearSnow')
			this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
			this.capped = new Map()

			this.buildSnow()
			this.initCaps()

			XF.on(this.reducedMotion, 'change', this.buildSnow.bind(this))
			XF.on(window, 'resize', this.onResize.bind(this), { passive: true })
			XF.on(document, 'visibilitychange', this.onVisibilityChange.bind(this))
		},

		onResize ()
		{
			window.clearTimeout(this.resizeTimer)
			this.resizeTimer = window.setTimeout(() =>
			{
				if (Math.abs(window.innerWidth - this.lastWidth) > 160)
				{
					this.buildSnow()
				}

				const resized = []
				this.capped.forEach((state, target) =>
				{
					if (Math.abs(target.clientWidth - state.width) > 24)
					{
						resized.push({ target, index: state.index })
					}
				})
				this.buildCaps(resized)
			}, 300)
		},

		onVisibilityChange ()
		{
			this.setSnowRunning(!document.hidden)
		},

		setSnowRunning (isRunning)
		{
			if (!this.snow || !this.snow.getAnimations)
			{
				return
			}

			this.snow.getAnimations({ subtree: true }).forEach(animation =>
			{
				if (isRunning)
				{
					animation.play()
				}
				else
				{
					animation.pause()
				}
			})
		},

		getFlakeCount ()
		{
			const count = parseInt(this.options.snowCount, 10) || 0
			const connection = navigator.connection

			if (!count || this.reducedMotion.matches || (connection && connection.saveData))
			{
				return 0
			}

			const area = window.innerWidth * window.innerHeight / (1440 * 900)
			const isWeakDevice = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4

			return Math.round(count * Math.min(1.25, Math.max(0.35, area)) * (isWeakDevice ? 0.6 : 1))
		},

		buildSnow ()
		{
			if (!this.snow)
			{
				return
			}

			this.lastWidth = window.innerWidth
			this.snow.textContent = ''

			const count = this.getFlakeCount()
			const fragment = document.createDocumentFragment()

			for (let i = 0; i < count; i++)
			{
				const position = i / count
				const kind = position < FLAKES.far.share
					? 'far'
					: (position < FLAKES.far.share + FLAKES.mid.share ? 'mid' : 'near')

				fragment.append(this.createFlake(kind))
			}

			this.snow.append(fragment)
		},

		createFlake (kind)
		{
			const settings = FLAKES[kind]
			const flake = document.createElement('span')
			const duration = between(...settings.duration)
			const set = (name, value) => flake.style.setProperty('--nt-new-year-' + name, value)

			flake.className = 'ntNewYear-flake ntNewYear-flake--' + kind
			if (kind === 'near' && Math.random() < 0.5)
			{
				flake.classList.add('ntNewYear-flake--alt')
			}

			set('x', between(0, 100).toFixed(2) + '%')
			set('size', between(...settings.size).toFixed(1) + 'px')
			set('opacity', between(...settings.opacity).toFixed(2))
			set('duration', duration.toFixed(1) + 's')
			set('delay', (-between(0, duration)).toFixed(1) + 's')
			set('drift', between(-settings.drift, settings.drift).toFixed(0) + 'px')

			if (settings.sway)
			{
				const swayDuration = between(3, 6)

				set('sway', between(...settings.sway).toFixed(0) + 'px')
				set('sway-duration', swayDuration.toFixed(1) + 's')
				set('sway-delay', (-between(0, swayDuration)).toFixed(1) + 's')
			}

			flake.append(document.createElement('i'))

			return flake
		},

		initCaps ()
		{
			if (!this.options.caps)
			{
				return
			}

			const items = Array.from(document.querySelectorAll(this.options.capTargets))
				.filter(target => window.getComputedStyle(target).overflow === 'visible')
				.slice(0, this.options.capLimit)
				.map((target, index) => ({ target, index }))

			this.buildCaps(items)
		},

		buildCaps (items)
		{
			const measured = items.map(item => ({
				target: item.target,
				index: item.index,
				width: item.target.clientWidth,
				room: this.getRoomAbove(item.target),
			}))

			measured.forEach(item => this.buildCap(item.target, item.index, item.width, item.room))
		},

		getRoomAbove (target)
		{
			let node = target.parentElement

			while (node && node !== document.body)
			{
				if (window.getComputedStyle(node).overflowY !== 'visible')
				{
					return target.getBoundingClientRect().top - node.getBoundingClientRect().top
				}
				node = node.parentElement
			}

			return Infinity
		},

		getDaySeed ()
		{
			const today = new Date()
			return today.getFullYear() * 372 + today.getMonth() * 31 + today.getDate()
		},

		buildCap (target, index, width, room)
		{
			const previous = this.capped.get(target)
			if (previous && previous.wrap)
			{
				previous.wrap.remove()
			}

			if (!width || room < 12)
			{
				this.capped.set(target, { wrap: null, width: 0, index })
				return
			}

			const random = createRandom((index + 1) * 7919 + this.getDaySeed() * 104729)
			const wrap = document.createElement('span')
			wrap.className = 'ntNewYear-caps'

			for (const cap of this.getCapLayout(random, target, width, room))
			{
				const built = createCap(random, cap.length, cap.maxHeight)
				const holder = document.createElement('span')

				holder.className = 'ntNewYear-capHolder'
				holder.style.left = cap.left + 'px'
				holder.style.bottom = (-built.lip).toFixed(1) + 'px'
				holder.append(built.svg)
				wrap.append(holder)
			}

			target.classList.add('ntNewYear-capped')
			target.append(wrap)
			this.capped.set(target, { wrap, width, index })
		},

		getCapLayout (random, target, width, room)
		{
			if (target.matches('.button'))
			{
				const length = Math.round(Math.min(width - 12, between(46, 82, random)))
				return [{ length, maxHeight: 6, left: random() < 0.5 ? 6 : width - length - 6 }]
			}

			const isNarrow = width < 420
			const sideLength = () => Math.round(isNarrow ? between(70, 140, random) : between(104, 234, random))
			const maxHeight = () => Math.min(room - 2, Math.round(between(isNarrow ? 9 : 11, isNarrow ? 16 : 18, random)))
			const layout = Math.floor(random() * (isNarrow ? 3 : 4))
			const caps = []

			if (layout !== 1)
			{
				caps.push({ length: sideLength(), maxHeight: maxHeight(), left: Math.round(between(8, 22, random)) })
			}
			if (layout !== 0)
			{
				const length = sideLength()
				caps.push({ length, maxHeight: maxHeight(), left: Math.round(width - length - between(8, 22, random)) })
			}
			if (layout === 3 && width > 700)
			{
				caps.push({ length: Math.round(between(110, 260, random)), maxHeight: maxHeight(), left: Math.round(width * between(0.3, 0.6, random)) })
			}

			return caps
		},
	})

	XF.NtNewYearCountdown = XF.Element.newHandler({
		options: {},

		days: null,
		clock: null,
		timer: null,

		init ()
		{
			this.days = this.target.querySelector('.js-ntNewYearCountdownDays')
			this.clock = this.target.querySelector('.js-ntNewYearCountdownClock')

			this.update()
			this.target.hidden = false

			this.timer = window.setInterval(() =>
			{
				if (!document.hidden)
				{
					this.update()
				}
			}, 1000)

			XF.on(document, 'visibilitychange', () =>
			{
				if (!document.hidden)
				{
					this.update()
				}
			})
		},

		update ()
		{
			const now = new Date()
			const isNewYear = now.getMonth() === 0

			this.target.classList.toggle('is-done', isNewYear)

			if (isNewYear)
			{
				this.setText(this.days, this.target.dataset.done)
				this.setText(this.clock, '')
				window.clearInterval(this.timer)
				return
			}

			const seconds = Math.max(0, Math.floor((new Date(now.getFullYear() + 1, 0, 1) - now) / 1000))
			const days = Math.floor(seconds / 86400)
			const clock = [seconds % 86400 / 3600, seconds % 3600 / 60, seconds % 60]
				.map(value => pad(Math.floor(value)))
				.join(':')

			this.target.classList.toggle('has-days', days > 0)
			this.setText(this.days, days > 0 ? this.target.dataset.days.replace('{days}', days) : '')
			this.setText(this.clock, clock)
		},

		setText (element, text)
		{
			if (element.textContent !== text)
			{
				element.textContent = text
			}
		},
	})

	XF.Element.register('nt-new-year', 'XF.NtNewYear')
	XF.Element.register('nt-new-year-countdown', 'XF.NtNewYearCountdown')
})(window, document)
