import { Component, Prop } from '@stencil/core';

@Component({
	tag: 'my-test',
	shadow: true
})
export class Test {
  @Prop() person: any

	render() {
		const {age, name} = this.person
		return (
			<div>
				{name}
				{age}
			</div>
		)
	}
}