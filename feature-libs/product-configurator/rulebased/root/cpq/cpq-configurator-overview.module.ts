import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CmsConfig, provideDefaultConfig } from '@spartacus/core';
import { CmsPageGuard, PageLayoutComponent } from '@spartacus/storefront';

/**
 * Takes care of the configuration overview that visualizes the attribute value assignments that have been done already in a condensed, read-only form.
 * The end-user can switch between the interactive view and this overview.
 * Provides routing, assignment of ng components to CMS components and assignment of CMS components to the layout slots.
 * Some of the ng components on this view (tab bar, price summary and addToCart button) are shared between the interactive view and the overview.
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: null,
        component: PageLayoutComponent,
        data: {
          cxRoute: 'configureOverviewCLOUDCPQCONFIGURATOR',
        },
        canActivate: [CmsPageGuard],
      },
    ]),
  ],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      layoutSlots: {
        CpqConfigurationOverviewTemplate: {
          header: {
            md: {
              slots: [
                'PreHeader',
                'SiteContext',
                'SiteLinks',
                'SiteLogo',
                'SearchBox',
                'SiteLogin',
                'MiniCart',
              ],
            },
            xs: {
              slots: ['PreHeader', 'SiteLogo', 'SearchBox', 'MiniCart'],
            },
          },
          navigation: {
            xs: {
              slots: ['SiteLogin', 'SiteContext', 'SiteLinks'],
            },
          },

          md: {
            slots: [
              'CpqConfigOverviewHeader',
              'CpqConfigOverviewBanner',
              'CpqConfigOverviewContent',
              'CpqConfigOverviewBottombar',
            ],
          },
          xs: {
            slots: [
              'CpqConfigOverviewHeader',
              'CpqConfigOverviewBanner',
              'CpqConfigOverviewContent',
              'CpqConfigOverviewBottombar',
            ],
          },
        },
      },
    }),
  ],
})
export class CpqConfiguratorOverviewModule {}