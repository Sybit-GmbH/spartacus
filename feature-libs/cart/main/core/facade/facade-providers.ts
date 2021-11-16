import { Provider } from '@angular/core';
import {
  ActiveCartFacade,
  CartValidationFacade,
  CartVoucherFacade,
  MultiCartFacade,
  SelectiveCartFacade,
  WishListFacade,
} from '@spartacus/cart/main/root';
import { ActiveCartService } from './active-cart.service';
import { CartValidationService } from './cart-validation.service';
import { CartVoucherService } from './cart-voucher.service';
import { MultiCartService } from './multi-cart.service';
import { SelectiveCartService } from './selective-cart.service';
import { WishListService } from './wish-list.service';

export const facadeProviders: Provider[] = [
  ActiveCartService,
  {
    provide: ActiveCartFacade,
    useExisting: ActiveCartService,
  },
  CartVoucherService,
  {
    provide: CartVoucherFacade,
    useExisting: CartVoucherService,
  },
  MultiCartService,
  {
    provide: MultiCartFacade,
    useExisting: MultiCartService,
  },
  SelectiveCartService,
  {
    provide: SelectiveCartFacade,
    useExisting: SelectiveCartService,
  },
  WishListService,
  {
    provide: WishListFacade,
    useExisting: WishListService,
  },
  CartValidationService,
  {
    provide: CartValidationFacade,
    useExisting: CartValidationService,
  },
];