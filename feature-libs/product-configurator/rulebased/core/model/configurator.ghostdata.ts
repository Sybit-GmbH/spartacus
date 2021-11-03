import { Configurator } from './configurator.model';
import { CommonConfigurator } from '@spartacus/product-configurator/common';

const ghostAttributes: Configurator.Attribute[] = [];
for (let i = 0; i < 3; i++) {
  ghostAttributes.push({
    name: 'Ghost Attribute',
    uiType: Configurator.UiType.DROPDOWN,
    selectedSingleValue: 'Value1',
    values: [
      {
        valueCode: 'Value1',
        valuePrice: {
          value: 1000,
          currencyIso: '$',
        },
      },
    ],
  });

  ghostAttributes.push({
    name: 'Ghost Attribute 2',
    uiType: Configurator.UiType.RADIOBUTTON,
    values: [
      {
        valueCode: 'Value1',
      },
      {
        valueCode: 'Value2',
        valuePrice: {
          value: 1000,
          currencyIso: '$',
        },
      },
      {
        valueCode: 'Value3',
        valuePrice: {
          value: 1000,
          currencyIso: '$',
        },
      },
    ],
  });
}

const ghostGroups: Configurator.Group[] = [];
for (let i = 0; i < 10; i++) {
  ghostGroups.push({
    id: i + '',
    description: 'Ghost group ' + i,
    name: 'Ghost group' + i,
    subGroups: [],
    attributes: ghostAttributes,
    complete: true,
    consistent: true,
  });
}

const ghostOverviewAttributes: Configurator.AttributeOverview[] = [];
for (let i = 0; i < 6; i++) {
  ghostOverviewAttributes.push({
    attribute: 'Ghost Attribute ' + i,
    value: 'Ghost Value ' + i,
    type: Configurator.AttributeOverviewType.GENERAL,
  });
}

const ghostOverviewGroups: Configurator.GroupOverview[] = [];
for (let i = 0; i < 3; i++) {
  ghostOverviewGroups.push({
    id: i + '',
    groupDescription: 'Ghost group ' + i,
    attributes: ghostOverviewAttributes,
  });
}

export const ghostConfigurationId: string = 'GHOST_CONFIGURATION';

export const ghostConfiguration: Configurator.Configuration = {
  configId: ghostConfigurationId,
  groups: ghostGroups,
  flatGroups: ghostGroups,
  interactionState: {},
  overview: { configId: ghostConfigurationId, groups: ghostOverviewGroups },
  owner: {
    type: CommonConfigurator.OwnerType.PRODUCT,
    key: '',
    id: '',
    configuratorType: '',
  },
};
