import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule } from '@spartacus/core';
import { ItemCounterComponent } from '@spartacus/storefront';
import { UrlTestingModule } from 'projects/core/src/routing/configurable-routes/url-translation/testing/url-testing.module';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorShowMoreComponent } from '../../../show-more/configurator-show-more.component';
import { ConfiguratorAttributeProductCardComponent } from '../../product-card/configurator-attribute-product-card.component';
import { ConfiguratorAttributeSingleSelectionBundleComponent } from './configurator-attribute-single-selection-bundle.component';

let testAttribute: Configurator.Attribute;

const createTestValue = (
  price: number,
  total: number,
  selected = true
): Configurator.Value => ({
  selected,
  valuePrice: {
    value: price,
  },
  valuePriceTotal: {
    value: total,
  },
});

@Component({
  selector: 'cx-configurator-attribute-product-card',
  template: '',
})
class MockProductCardComponent {}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'cx-configurator-price',
  template: '',
})
class MockConfiguratorPriceComponent {
  @Input() productPrice: number;
  @Input() quantity = 1;
  @Input() totalPrice: number;
}

describe('ConfiguratorAttributeSingleSelectionBundleComponent', () => {
  let component: ConfiguratorAttributeSingleSelectionBundleComponent;
  let fixture: ComponentFixture<ConfiguratorAttributeSingleSelectionBundleComponent>;
  let htmlElem: HTMLElement;

  const createImage = (url: string, altText: string): Configurator.Image => {
    const image: Configurator.Image = {
      url: url,
      altText: altText,
    };
    return image;
  };

  const createValue = (
    description: string,
    images: Configurator.Image[],
    name,
    quantity: number,
    selected: boolean,
    valueCode: string,
    valueDisplay: string
  ): Configurator.Value => {
    const value: Configurator.Value = {
      description,
      images,
      name,
      quantity,
      selected,
      valueCode,
      valueDisplay,
    };
    return value;
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          I18nTestingModule,
          RouterTestingModule,
          UrlTestingModule,
          ReactiveFormsModule,
        ],
        declarations: [
          ConfiguratorAttributeSingleSelectionBundleComponent,
          ConfiguratorShowMoreComponent,
          ItemCounterComponent,
          MockProductCardComponent,
          MockConfiguratorPriceComponent,
        ],
      })
        .overrideComponent(
          ConfiguratorAttributeSingleSelectionBundleComponent,
          {
            set: {
              changeDetection: ChangeDetectionStrategy.Default,
              providers: [
                {
                  provide: ConfiguratorAttributeProductCardComponent,
                  useClass: MockProductCardComponent,
                },
              ],
            },
          }
        )
        .compileComponents();
    })
  );

  beforeEach(() => {
    const values: Configurator.Value[] = [
      createValue(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        [createImage('url', 'alt')],
        'valueName',
        1,
        true,
        '1111',
        'Lorem Ipsum Dolor'
      ),
      createValue(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        [createImage('url', 'alt')],
        'valueName',
        1,
        false,
        '2222',
        'Lorem Ipsum Dolor'
      ),
      createValue(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        [createImage('url', 'alt')],
        'valueName',
        1,
        false,
        '3333',
        'Lorem Ipsum Dolor'
      ),
      createValue(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        [createImage('url', 'alt')],
        'valueName',
        1,
        false,
        '4444',
        'Lorem Ipsum Dolor'
      ),
    ];

    fixture = TestBed.createComponent(
      ConfiguratorAttributeSingleSelectionBundleComponent
    );

    component = fixture.componentInstance;
    htmlElem = fixture.nativeElement;

    component.ownerKey = 'theOwnerKey';
    component.attribute = {
      name: 'attributeName',
      attrCode: 1111,
      uiType: Configurator.UiType.RADIOBUTTON_PRODUCT,
      required: true,
      groupId: 'testGroup',
      values,
      dataType: Configurator.DataType.USER_SELECTION_QTY_ATTRIBUTE_LEVEL,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 multi selection bundle items after init', () => {
    fixture.detectChanges();

    const cardList = htmlElem.querySelectorAll(
      'cx-configurator-attribute-product-card'
    );

    expect(cardList.length).toBe(4);
  });

  it('should mark one items as selected', () => {
    expect(component.attribute.values[0].selected).toEqual(true);
    expect(component.attribute.values[1].selected).toEqual(false);
    expect(component.attribute.values[2].selected).toEqual(false);
    expect(component.attribute.values[3].selected).toEqual(false);
  });

  it('should call emit of event onSelect', () => {
    spyOn(component.selectionChange, 'emit').and.callThrough();

    component.onSelect('1111');

    expect(component.selectionChange.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        changedAttribute: jasmine.objectContaining({
          ...component.attribute,
          selectedSingleValue: '1111',
        }),
        ownerKey: component.ownerKey,
        updateType: Configurator.UpdateType.ATTRIBUTE,
      })
    );
  });

  it('should call emit of event onDeselect', () => {
    spyOn(component.selectionChange, 'emit').and.callThrough();

    component.onDeselect();

    expect(component.selectionChange.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        changedAttribute: jasmine.objectContaining({
          ...component.attribute,
          selectedSingleValue: '',
        }),
        ownerKey: component.ownerKey,
        updateType: Configurator.UpdateType.ATTRIBUTE,
      })
    );
  });

  it('should call emit of event onHandleQuantity', () => {
    spyOn(component.selectionChange, 'emit').and.callThrough();

    component.onHandleQuantity(2);

    expect(component.selectionChange.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        changedAttribute: jasmine.objectContaining({
          ...component.attribute,
          quantity: 2,
        }),
        ownerKey: component.ownerKey,
        updateType: Configurator.UpdateType.ATTRIBUTE_QUANTITY,
      })
    );
  });

  it('should call onHandleQuantity of event onChangeQuantity', () => {
    spyOn(component, 'onHandleQuantity');

    const quantity = { quantity: 2 };

    component.onChangeQuantity(quantity);

    expect(component.onHandleQuantity).toHaveBeenCalled();
  });

  it('should call onDeselect of event onChangeQuantity', () => {
    spyOn(component, 'onDeselect');

    const quantity = { quantity: 0 };

    component.onChangeQuantity(quantity);

    expect(component.onDeselect).toHaveBeenCalled();
  });

  describe('selected value price calculation', () => {
    describe('should return number', () => {
      it('on selected value only', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [createTestValue(100, 100)],
        };

        const valuePrice = component.getSelectedValuePrice(testAttribute);

        expect(valuePrice).toEqual(100);
      });

      it('on selected value', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [createTestValue(100, 100), createTestValue(100, 100, false)],
        };

        const valuePrice = component.getSelectedValuePrice(testAttribute);

        expect(valuePrice).toEqual(100);
      });
    });

    describe('should not return number', () => {
      it('without values property', () => {
        testAttribute = {
          name: 'testAttribute',
        };

        const valuePrice = component.getSelectedValuePrice(testAttribute);

        expect(valuePrice).toBeUndefined();
      });

      it('without values', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [],
        };

        const valuePrice = component.getSelectedValuePrice(testAttribute);

        expect(valuePrice).toBeUndefined();
      });

      it('without price property', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [createTestValue(undefined, undefined)],
        };

        const valuePrice = component.getSelectedValuePrice(testAttribute);

        expect(valuePrice).toBeUndefined();
      });
    });
  });

  describe('selected value price total calculation', () => {
    describe('should return number', () => {
      it('on selected value only', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [createTestValue(100, 100)],
        };

        const valuePrice = component.getSelectedValuePriceTotal(testAttribute);

        expect(valuePrice).toEqual(100);
      });

      it('on selected value', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [createTestValue(100, 100), createTestValue(100, 100, false)],
        };

        const valuePrice = component.getSelectedValuePriceTotal(testAttribute);

        expect(valuePrice).toEqual(100);
      });
    });

    describe('should not return number', () => {
      it('without values property', () => {
        testAttribute = {
          name: 'testAttribute',
        };

        const valuePrice = component.getSelectedValuePriceTotal(testAttribute);

        expect(valuePrice).toBeUndefined();
      });

      it('without values', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [],
        };

        const valuePrice = component.getSelectedValuePriceTotal(testAttribute);

        expect(valuePrice).toBeUndefined();
      });

      it('without price property', () => {
        testAttribute = {
          name: 'testAttribute',
          values: [createTestValue(undefined, undefined)],
        };

        const valuePrice = component.getSelectedValuePriceTotal(testAttribute);

        expect(valuePrice).toBeUndefined();
      });
    });
  });
});
