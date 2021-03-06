import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import noop from 'lodash/noop';
import { WithContext as ReactTags } from '../lib/ReactTags';

const defaults = {
  tags: [{ id: 1, text: "Apple" }],
  suggestions: ["Banana", "Apple", "Apricot", "Pear", "Peach"],
  handleAddition: noop,
  handleDelete: noop,
  handleDrag: noop
}

function mockItem(overrides) {
  const props = Object.assign({}, defaults, overrides);
  return <ReactTags {...props} />
}

describe("ReactTags", () => {
  it("shows the classnames of children properly", () => {
    const $el = mount(mockItem());
    expect($el.find('.ReactTags__tags').length).to.equal(1);
    expect($el.find('.ReactTags__selected').length).to.equal(1);
    expect($el.find('.ReactTags__tagInput').length).to.equal(1);
  });

  it("renders preselected tags properly", () => {
    const $el = mount(mockItem());
    expect($el.text()).to.have.string("Apple");
  });

  it("invokes the onBlur event", () => {

    const handleInputBlur = spy();
    const $el = mount(mockItem());

    // Won't be invoked as there's no `handleInputBlur` event yet.
    $el.find('.ReactTags__tagInput input').simulate('blur');
    expect(handleInputBlur.callCount).to.equal(0);

    // Still won't be invoked, as the input value is empty.
    $el.setProps({ handleInputBlur });
    $el.find('.ReactTags__tagInput input').simulate('blur');
    expect(handleInputBlur.callCount).to.equal(0);

    // Voila...
    $el.find('.ReactTags__tagInput input').get(0).value = 'Example';
    $el.find('.ReactTags__tagInput input').simulate('blur');
    expect(handleInputBlur.callCount).to.equal(1);
    expect(handleInputBlur.calledWith('Example')).to.be.true;
    expect($el.find('.ReactTags__tagInput input').get(0).value).to.be.empty;

  });

  describe('autocomplete/suggestions filtering', () => {
    it('updates suggestions state as expected based on default filter logic', () => {
      const $el = mount(mockItem())
      const ReactTagsInstance = $el.instance().refs.child
      const $input = $el.find('.ReactTags__tagInput input')

      expect(ReactTagsInstance.state.suggestions).to.have.members(defaults.suggestions)

      $input.simulate('change', {target: {value: 'ea'}})
      expect(ReactTagsInstance.state.suggestions).to.have.members([])

      $input.simulate('change', {target: {value: 'ap'}})
      expect(ReactTagsInstance.state.suggestions).to.have.members(['Apple', 'Apricot'])
    })

    it('updates suggestions state as expected based on custom filter logic', () => {
      const $el = mount(
          mockItem({
            handleFilterSuggestions: (query, suggestions) => {
              return suggestions.filter(suggestion => {
                return suggestion.toLowerCase().indexOf(query.toLowerCase()) >= 0
              })
            }
          })
      )
      const ReactTagsInstance = $el.instance().refs.child
      const $input = $el.find('.ReactTags__tagInput input')

      expect(ReactTagsInstance.state.suggestions).to.have.members(defaults.suggestions)

      $input.simulate('change', {target: {value: 'Ea'}})
      expect(ReactTagsInstance.state.suggestions).to.have.members(['Pear', 'Peach'])

      $input.simulate('change', {target: {value: 'ap'}})
      expect(ReactTagsInstance.state.suggestions).to.have.members(['Apple', 'Apricot'])
    })
  })
})
