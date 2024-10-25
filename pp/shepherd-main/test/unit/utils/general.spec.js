import { jest } from '@jest/globals';
import { Step } from '../../../shepherd.js/src/step';
import {
  parseAttachTo,
  shouldCenterStep
} from '../../../shepherd.js//src/utils/general';
import { getFloatingUIOptions } from '../../../shepherd.js/src/utils/floating-ui';

describe('General Utils', function () {
  let optionsElement;

  beforeEach(() => {
    optionsElement = document.createElement('div');
    optionsElement.classList.add('options-test');
    document.body.appendChild(optionsElement);
  });

  afterEach(() => {
    document.body.removeChild(optionsElement);
  });

  describe('parseAttachTo()', function () {
    it('fails if element does not exist', function () {
      const step = new Step(
        {},
        {
          attachTo: { element: '.element-does-not-exist', on: 'center' }
        }
      );

      const { element } = parseAttachTo(step);
      expect(element).toBeFalsy();
    });

    it('accepts callback function as element', function () {
      const callback = jest.fn();

      const step = new Step(
        {},
        {
          attachTo: { element: callback, on: 'center' }
        }
      );

      parseAttachTo(step);
      expect(callback).toHaveBeenCalled();
    });

    it('correctly resolves elements when given function that returns a selector', function () {
      const step = new Step(
        {},
        {
          attachTo: { element: () => 'body', on: 'center' }
        }
      );

      const { element } = parseAttachTo(step);
      expect(element).toBe(document.body);
    });

    it('binds element callback to step', function () {
      const step = new Step(
        {},
        {
          attachTo: {
            element() {
              expect(this).toBe(step);
            },
            on: 'center'
          }
        }
      );

      parseAttachTo(step);
    });
  });

  describe('floatingUIOptions', function () {
    it('middleware can be overridden', function () {
      const step = new Step(
        {},
        {
          attachTo: { element: '.options-test', on: 'right' },
          floatingUIOptions: {
            middleware: [
              {
                name: 'preventOverflow',
                options: {
                  altAxis: false
                }
              }
            ]
          }
        }
      );

      const floatingUIOptions = getFloatingUIOptions(
        step.options.attachTo,
        step
      );
      expect(floatingUIOptions.middleware[0].options.altAxis).toBe(false);
    });

    it('positioning strategy is explicitly set', function () {
      const step = new Step(
        {},
        {
          attachTo: { element: '.options-test', on: 'center' },
          options: {
            floatingUIOptions: {
              strategy: 'absolute'
            }
          }
        }
      );

      const floatingUIOptions = getFloatingUIOptions(
        step.options.attachTo,
        step
      );
      expect(floatingUIOptions.strategy).toBe('absolute');
    });
  });

  describe('shouldCenterStep()', () => {
    it('Returns true when resolved attachTo options are falsy', () => {
      const emptyObjAttachTo = {};
      const emptyArrAttachTo = [];
      const nullAttachTo = null; // FAILS Cannot read properties of null (reading 'element')
      const undefAttachTo = undefined; // FAILS Cannot read properties of undefined (reading 'element')

      expect(shouldCenterStep(emptyObjAttachTo)).toBe(true);
      expect(shouldCenterStep(emptyArrAttachTo)).toBe(true);
      expect(shouldCenterStep(nullAttachTo)).toBe(true);
      expect(shouldCenterStep(undefAttachTo)).toBe(true);
    });

    it('Returns false when element and on properties are truthy', () => {
      const testAttachTo = {
        element: '.pseudo',
        on: 'right'
      };

      expect(shouldCenterStep(testAttachTo)).toBe(false);
    });

    it('Returns true when element property is null', () => {
      const elementAttachTo = { element: null }; // FAILS

      expect(shouldCenterStep(elementAttachTo)).toBe(true);
    });
  });
});
