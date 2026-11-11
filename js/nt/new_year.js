((window, document) =>
{
	'use strict'

	const NT = window.NT = window.NT || {}

	const SVG_NS = 'http://www.w3.org/2000/svg'

	const FLAKES = {
		far: { share: 0.55, size: [2, 3.5], opacity: [0.25, 0.5], duration: [16, 26], drift: 30, sway: null },
		mid: { share: 0.3, size: [3.5, 6], opacity: [0.45, 0.8], duration: [11, 17], drift: 20, sway: [8, 20] },
		near: { share: 0.15, size: [11, 17], opacity: [0.3, 0.6], duration: [9, 14], drift: 20, sway: [14, 30] },
	}

	const FLAKE_PATHS = [
		'M12 12L12 2.5M9.79 4.08L12 5.8L14.21 4.08M12 12L20.23 7.25M17.76 6.13L17.37 8.9L19.97 9.95M12 12L20.23 16.75M19.97 14.05L17.37 15.1L17.76 17.87M12 12L12 21.5M14.21 19.92L12 18.2L9.79 19.92M12 12L3.77 16.75M6.24 17.87L6.63 15.1L4.03 14.05M12 12L3.77 7.25M4.03 9.95L6.63 8.9L6.24 6.13',
		'M12 7.8L15.64 9.9M12 7.8L12 2.5M15.64 9.9L15.64 14.1M15.64 9.9L20.23 7.25M15.64 14.1L12 16.2M15.64 14.1L20.23 16.75M12 16.2L8.36 14.1M12 16.2L12 21.5M8.36 14.1L8.36 9.9M8.36 14.1L3.77 16.75M8.36 9.9L12 7.8M8.36 9.9L3.77 7.25',
	]

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

	const whenIdle = callback =>
	{
		if (window.requestIdleCallback)
		{
			window.requestIdleCallback(callback, { timeout: 1500 })
		}
		else
		{
			window.setTimeout(callback, 200)
		}
	}

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

	NT.NewYear = XF.Element.newHandler({
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

			whenIdle(() =>
			{
				this.setSnowRunning(!document.hidden)
				this.buildSnow()
				this.initCaps()

				XF.on(this.reducedMotion, 'change', this.buildSnow.bind(this))
				XF.on(window, 'resize', this.onResize.bind(this), { passive: true })
				XF.on(document, 'visibilitychange', this.onVisibilityChange.bind(this))
			})
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
			if (this.snow)
			{
				this.snow.classList.toggle('is-paused', !isRunning)
			}
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

				const inner = document.createElement('i')
				if (kind === 'near')
				{
					const shape = createSvg('svg', { viewBox: '0 0 24 24', focusable: 'false' })
					shape.append(createSvg('path', { d: FLAKE_PATHS[Math.random() < 0.5 ? 0 : 1] }))
					inner.append(shape)
				}
				flake.append(inner)
			}

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

	NT.NewYearCountdown = XF.Element.newHandler({
		options: {},

		days: null,
		clock: null,
		timer: null,
		isDone: false,

		init ()
		{
			this.days = this.target.querySelector('.js-ntNewYearCountdownDays')
			this.clock = this.target.querySelector('.js-ntNewYearCountdownClock')

			this.update()
			this.target.hidden = false
			this.schedule()

			XF.on(document, 'visibilitychange', () =>
			{
				if (!document.hidden)
				{
					this.update()
					this.schedule()
				}
			})
		},

		schedule ()
		{
			window.clearTimeout(this.timer)

			if (this.isDone || document.hidden)
			{
				return
			}

			this.timer = window.setTimeout(() =>
			{
				this.update()
				this.schedule()
			}, 1000 - Date.now() % 1000 + 15)
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
				this.isDone = true
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

	XF.Element.register('nt-new-year', 'NT.NewYear')
	XF.Element.register('nt-new-year-countdown', 'NT.NewYearCountdown')
})(window, document)
