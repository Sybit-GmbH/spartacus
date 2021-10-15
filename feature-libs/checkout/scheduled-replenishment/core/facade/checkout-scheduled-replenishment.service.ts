import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  RestoreSavedCartSuccessEvent,
  SaveCartSuccessEvent,
} from '@spartacus/cart/saved-cart/root';
import {
  CheckoutFacade,
  DeliveryAddressClearedEvent,
  DeliveryAddressSetEvent,
  DeliveryModeClearedEvent,
  DeliveryModeSetEvent,
  OrderPlacedEvent,
  PaymentDetailsCreatedEvent,
  PaymentDetailsSetEvent,
  ReplenishmentOrderScheduledEvent,
} from '@spartacus/checkout/root';
import { CheckoutScheduledReplenishmentFacade } from '@spartacus/checkout/scheduled-replenishment/root';
import {
  ActiveCartService,
  CartActions,
  Command,
  CommandService,
  CommandStrategy,
  EventService,
  LoginEvent,
  LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  ORDER_TYPE,
  ReplenishmentOrder,
  ScheduleReplenishmentForm,
  StateWithMultiCart,
  UserIdService,
} from '@spartacus/core';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { CheckoutReplenishmentOrderConnector } from '../connectors/replenishment-order/checkout-replenishment-order.connector';

@Injectable()
export class CheckoutScheduledReplenishmentService
  implements CheckoutScheduledReplenishmentFacade
{
  protected orderType$ = new BehaviorSubject<ORDER_TYPE>(
    ORDER_TYPE.PLACE_ORDER
  );

  protected scheduleReplenishmentOrderCommand: Command<
    { termsChecked: boolean; form: ScheduleReplenishmentForm },
    ReplenishmentOrder
  > = this.command.create<
    { termsChecked: boolean; form: ScheduleReplenishmentForm },
    ReplenishmentOrder
  >(
    ({ form, termsChecked }) => {
      return combineLatest([
        this.userIdService.takeUserId(),
        this.activeCartService.getActiveCartId(),
      ]).pipe(
        take(1),
        switchMap(([userId, cartId]) => {
          if (
            !userId ||
            !cartId ||
            (userId === OCC_USER_ID_ANONYMOUS &&
              !this.activeCartService.isGuestCart())
          ) {
            throw new Error('Checkout conditions not met');
          }
          return this.checkoutReplenishmentOrderConnector
            .scheduleReplenishmentOrder(cartId, form, termsChecked, userId)
            .pipe(
              tap((replenishmentOrder) => {
                this.checkoutService.setOrder(replenishmentOrder);
                this.store.dispatch(new CartActions.RemoveCart({ cartId }));
                this.eventService.dispatch(
                  {
                    userId,
                    cartId,
                    replenishmentOrder,
                  },
                  ReplenishmentOrderScheduledEvent
                );
              })
            );
        })
      );
    },
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );

  constructor(
    protected store: Store<StateWithMultiCart>,
    protected activeCartService: ActiveCartService,
    protected userIdService: UserIdService,
    protected command: CommandService,
    protected checkoutReplenishmentOrderConnector: CheckoutReplenishmentOrderConnector,
    protected eventService: EventService,
    protected actions$: Actions,
    protected checkoutService: CheckoutFacade
  ) {
    // TODO: Double check and move to some method
    merge([
      this.eventService.get(DeliveryAddressSetEvent),
      this.eventService.get(LogoutEvent),
      this.eventService.get(LoginEvent),
      this.eventService.get(DeliveryAddressClearedEvent),
      this.eventService.get(DeliveryModeSetEvent),
      this.eventService.get(DeliveryModeClearedEvent),
      this.eventService.get(SaveCartSuccessEvent),
      this.eventService.get(RestoreSavedCartSuccessEvent),
      this.eventService.get(PaymentDetailsCreatedEvent),
      this.eventService.get(PaymentDetailsSetEvent),
      this.eventService.get(OrderPlacedEvent),
      this.eventService.get(ReplenishmentOrderScheduledEvent),
      this.actions$.pipe(ofType(CartActions.MERGE_CART_SUCCESS)),
    ]).subscribe(() => {
      this.orderType$.next(ORDER_TYPE.PLACE_ORDER);
    });
  }

  /**
   * Schedule a replenishment order
   */
  scheduleReplenishmentOrder(
    scheduleReplenishmentForm: ScheduleReplenishmentForm,
    termsChecked: boolean
  ): Observable<ReplenishmentOrder> {
    return this.scheduleReplenishmentOrderCommand.execute({
      termsChecked,
      form: scheduleReplenishmentForm,
    });
  }

  /**
   * Set checkout order type
   * @param orderType : an enum of types of order we are placing
   */
  setOrderType(orderType: ORDER_TYPE): void {
    this.orderType$.next(orderType);
  }

  /**
   * Get current checkout order type
   */
  getOrderType(): Observable<ORDER_TYPE> {
    return this.orderType$.asObservable();
  }
}
