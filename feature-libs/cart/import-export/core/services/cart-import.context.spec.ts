import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, ActionsSubject } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CartActions } from '@spartacus/core';
import {
  ProductData,
  ProductImportStatus,
} from '@spartacus/cart/import-export/core';
import { CartTypes } from '../model';
import { CartImportContext } from './cart-import.context';
import { ImportContext } from './import.context';

const mockActionsSubject = new BehaviorSubject<Action>(null);

const mockCartId = '00004546';

@Injectable({
  providedIn: 'root',
})
class TestCartImportExportContext
  extends CartImportContext
  implements ImportContext
{
  constructor(protected actionsSubject: ActionsSubject) {
    super(actionsSubject);
  }

  readonly type = 'TEST_CART' as CartTypes;

  protected add(products: ProductData[]): Observable<string> {
    return of(mockCartId);
  }
}

describe('CartImportExportContext', () => {
  let service: TestCartImportExportContext;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ useValue: mockActionsSubject, provide: ActionsSubject }],
    });
    service = TestBed.inject(TestCartImportExportContext);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addEntries', () => {
    it('should return success action', () => {
      let action;
      service.addEntries(mockProductData).subscribe((data) => (action = data));

      mockActionsSubject.next(
        new CartActions.CartAddEntrySuccess({
          userId: mockUserId,
          cartId: mockCartId,
          productCode: '693923',
          quantity: 1,
          entry: { product: { name: 'mockProduct1' } },
          quantityAdded: 1,
          statusCode: ProductImportStatus.SUCCESS,
        })
      );

      expect(action).toEqual({
        productCode: '693923',
        statusCode: ProductImportStatus.SUCCESS,
        productName: 'mockProduct1',
      });
    });

    it('should return low stock action', () => {
      let action;
      service.addEntries(mockProductData).subscribe((data) => (action = data));

      mockActionsSubject.next(
        new CartActions.CartAddEntrySuccess({
          userId: mockUserId,
          cartId: mockCartId,
          productCode: '693923',
          entry: { product: { name: 'mockProduct1' } },
          quantity: 4,
          quantityAdded: 1,
          statusCode: ProductImportStatus.LOW_STOCK,
        })
      );

      expect(action).toEqual({
        productName: 'mockProduct1',
        quantity: 4,
        quantityAdded: 1,
        productCode: '693923',
        statusCode: ProductImportStatus.LOW_STOCK,
      });
    });

    it('should return no stock action', () => {
      let action;
      service.addEntries(mockProductData).subscribe((data) => (action = data));

      mockActionsSubject.next(
        new CartActions.CartAddEntrySuccess({
          userId: mockUserId,
          cartId: mockCartId,
          productCode: '693923',
          entry: { product: { name: 'mockProduct1' } },
          quantity: 4,
          quantityAdded: 0,
          statusCode: ProductImportStatus.NO_STOCK,
        })
      );

      expect(action).toEqual({
        productCode: '693923',
        statusCode: ProductImportStatus.NO_STOCK,
        productName: 'mockProduct1',
      });
    });

    it('should return Unknown Identifier Error action', () => {
      let action;
      service.addEntries(mockProductData).subscribe((data) => (action = data));

      mockActionsSubject.next(
        new CartActions.CartAddEntryFail({
          userId: mockUserId,
          cartId: mockCartId,
          productCode: '693923',
          quantity: 1,
          error: { details: [{ type: 'UnknownIdentifierError' }] },
        })
      );

      expect(action).toEqual({
        productCode: '693923',
        statusCode: ProductImportStatus.UNKNOWN_IDENTIFIER,
      });
    });

    it('should return unknown error action', () => {
      let action;
      service.addEntries(mockProductData).subscribe((data) => (action = data));

      mockActionsSubject.next(
        new CartActions.CartAddEntrySuccess({
          userId: mockUserId,
          cartId: mockCartId,
          productCode: '693923',
          entry: { product: { name: 'mockProduct1' } },
          quantity: 4,
          quantityAdded: 1,
          statusCode: 'CODE_WHICH_WE_DIDNT_REGISTER',
        })
      );

      expect(action).toEqual({
        productCode: '693923',
        statusCode: ProductImportStatus.UNKNOWN_ERROR,
      });
    });
  });
});
