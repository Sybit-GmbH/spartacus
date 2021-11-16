import { Injectable } from '@angular/core';
import { DeliveryMode, facadeFactory, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_CORE_FEATURE } from '../feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    facadeFactory({
      facade: CheckoutDeliveryModesFacade,
      feature: CHECKOUT_CORE_FEATURE,
      methods: [
        'getSupportedDeliveryModesState',
        'getSupportedDeliveryModes',
        'setDeliveryMode',
        'getSelectedDeliveryModeState',
        'clearCheckoutDeliveryMode',
      ],
      async: true,
    }),
})
export abstract class CheckoutDeliveryModesFacade {
  /**
   * Returns the supported delivery modes state.
   */
  abstract getSupportedDeliveryModesState(): Observable<
    QueryState<DeliveryMode[]>
  >;
  /**
   * Returns the supported delivery modes, or an empty array if the data is undefined.
   */
  abstract getSupportedDeliveryModes(): Observable<DeliveryMode[]>;
  /**
   * Returns the selected delivery mode
   */
  abstract getSelectedDeliveryModeState(): Observable<
    QueryState<DeliveryMode | undefined>
  >;
  /**
   * Sets the provided delivery mode to the current cart
   */
  abstract setDeliveryMode(mode: string): Observable<unknown>;
  /**
   * Clears the selected delivery mode from the current cart
   */
  abstract clearCheckoutDeliveryMode(): Observable<unknown>;
}