import { LocationStrategy } from '@angular/common';
import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLinkWithHref,
  UrlTree,
} from '@angular/router';
import {
  CmsService,
  PageContext,
  PageType,
  ProductService,
  RoutingService,
} from '@spartacus/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[cxRouterLink]',
  exportAs: 'cxRouterLink',
})
export class CxRouterLinkDirective
  extends RouterLinkWithHref
  implements OnDestroy
{
  @Input() cxRouterLinkData?: { type: 'product' | 'cms'; id: string };

  protected cxCommands: any[] | null = null;
  protected cxRouter: Router;
  protected cxRoute: ActivatedRoute;
  protected subscriptions = new Subscription();

  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy,

    // products
    protected productService: ProductService,

    // cms
    protected routingService: RoutingService,
    protected cmsService: CmsService
  ) {
    super(router, route, locationStrategy);
    this.cxRouter = router;
    this.cxRoute = route;
  }

  // @override
  @Input()
  set cxRouterLink(commands: any[] | string | null | undefined) {
    if (commands != null) {
      this.cxCommands = Array.isArray(commands) ? commands : [commands];
    } else {
      this.cxCommands = null;
    }
  }

  // @override
  get urlTree(): UrlTree {
    return this.cxRouter.createUrlTree(this.cxCommands ?? [], {
      relativeTo:
        this.relativeTo !== undefined ? this.relativeTo : this.cxRoute,
      queryParams: this.queryParams,
      fragment: this.fragment,
      queryParamsHandling: this.queryParamsHandling,
      preserveFragment: attrBoolValue(this.preserveFragment),
    });
  }

  @HostListener('mouseenter') onHover() {
    if (this.cxRouterLinkData?.type === 'product') {
      const id = this.cxRouterLinkData.id;
      console.log(this.cxRouterLinkData);
      this.subscriptions.add(
        this.productService.get(id).pipe(take(2)).subscribe()
      );

      const predictedContext: PageContext = { id, type: PageType.PRODUCT_PAGE };
      this.subscriptions.add(
        this.cmsService.getPage(predictedContext).subscribe()
      );
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.subscriptions.unsubscribe();
  }
}

function attrBoolValue(s: any): boolean {
  return s === '' || !!s;
}