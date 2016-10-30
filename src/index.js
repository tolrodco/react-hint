import React from 'react'

export default class ReactHint extends React.Component {
	static _instance = null

	static get instance() {
		return ReactHint._instance
	}

	static set instance(instance) {
		if (ReactHint._instance) throw new Error('Only one instance of ReactHint is allowed.')
		ReactHint._instance = instance
	}

	static defaultProps = {
		className: 'react-hint'
	}

	state = {
		target: null,
		at: 'top',
		top: 0,
		left: 0
	}

	shouldComponentUpdate({className}, {target, at, top, left}) {
		const {props, state} = this
		return target !== state.target
			|| at !== state.at
			|| top !== state.top
			|| left !== state.left
			|| className !== props.className
	}

	componentDidMount() {
		ReactHint.instance = this
		document.addEventListener('mouseover', this.onHover)
	}

	componentDidUpdate() {
		const {target} = this.state
		if (!target) return
		this.setState(this.getPosition(target))
	}

	componentWillUnmout() {
		ReactHint.instance = null
		document.removeEventListener('mouseover', this.onHover)
	}

	findHint = (el) => {
		while (el) {
			if (el === document) break
			if (el.hasAttribute('data-rh')) return el
			el = el.parentNode
		} return null
	}

	getPosition = (target) => {
		const {_container, _hint} = this

		const {
			top: container_top,
			left: container_left,
		} = _container.getBoundingClientRect()

		const {
			width: hint_width,
			height: hint_height,
		} = _hint.getBoundingClientRect()

		const {
			top: target_top,
			left: target_left,
			width: target_width,
			height: target_height,
		} = target.getBoundingClientRect()

		let top, left
		const at = target.getAttribute('data-rh-at') || 'top'

		switch (at) {
			case 'left':
				top = target_height - hint_height >> 1
				left = -hint_width
				break

			case 'right':
				top = target_height - hint_height >> 1
				left = target_width
				break

			case 'bottom':
				top = target_height
				left = target_width - hint_width >> 1
				break

			case 'top':
			default:
				top = -hint_height
				left = target_width - hint_width >> 1
		}

		return {
			at,
			top: top + target_top - container_top,
			left: left + target_left - container_left
		}
	}

	onHover = ({target}) =>
		this.setState({target: this.findHint(target)})

	setRef = (name, ref) =>
		this[name] = ref

	render() {
		const {className} = this.props
		const {target, at, top, left} = this.state

		return (
			<div style={{position: 'relative'}}
				ref={this.setRef.bind(this, '_container')}>
					{target &&
						<div className={`${className} ${className}--${at}`}
							ref={this.setRef.bind(this, '_hint')}
							style={{top, left}}>
								<div className={`${className}__content`}>
									{target.getAttribute('data-rh')}
								</div>
						</div>
					}
			</div>
		)
	}
}