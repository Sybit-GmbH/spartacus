import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addLibraryFeature,
  addPackageJsonDependenciesForLibrary,
  CLI_EPD_VISUALIZATION_FEATURE,
  CustomConfig,
  EPD_VISUALIZATION_CONFIG,
  readPackageJson,
  shouldAddFeature,
  SPARTACUS_EPD_VISUALIZATION,
  validateSpartacusInstallation,
} from '@spartacus/schematics';
import { parse, stringify } from 'comment-json';
import { peerDependencies } from '../../package.json';
import {
  EPD_VISUALIZATION_FEATURE_NAME_CONSTANT,
  EPD_VISUALIZATION_FOLDER_NAME,
  EPD_VISUALIZATION_MODULE,
  EPD_VISUALIZATION_MODULE_NAME,
  EPD_VISUALIZATION_ROOT_MODULE,
  EPD_VISUALIZATION_TRANSLATIONS,
  EPD_VISUALIZATION_TRANSLATION_CHUNKS_CONFIG,
  SCSS_FILE_NAME,
  SPARTACUS_EPD_VISUALIZATION_ROOT,
  SPARTACUS_EPD_VISUALIZATION_ASSETS,
} from '../constants';
import { Schema as SpartacusEpdVisualizationOptions } from './schema';

const TSConfigFileName = 'tsconfig.json';

export function addEpdVisualizationFeature(
  options: SpartacusEpdVisualizationOptions
): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJson = readPackageJson(tree);
    validateSpartacusInstallation(packageJson);

    return chain([
      addPackageJsonDependenciesForLibrary(peerDependencies, options),

      shouldAddFeature(CLI_EPD_VISUALIZATION_FEATURE, options.features)
        ? chain([addEpdVisualization(options), updateTsConfig()])
        : noop(),
    ]);
  };
}

function addEpdVisualization(options: SpartacusEpdVisualizationOptions): Rule {
  const customConfig: CustomConfig[] = [
    {
      import: [
        {
          moduleSpecifier: SPARTACUS_EPD_VISUALIZATION_ROOT,
          namedImports: [EPD_VISUALIZATION_CONFIG],
        },
      ],
      content: `<${EPD_VISUALIZATION_CONFIG}>{
        ui5: {
          bootstrapUrl: "https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
        },

        usageIds: {
          folderUsageId: {
            name: "CommerceCloud-Folder",
            keys: [{
              name: "Function",
              value: "Online"
            }]
          },

          productUsageId: {
            name: "CommerceCloud-SparePart",
            source: "CommerceCloud",
            category: "SpareParts",
            keyName: "ProductCode"
          }
        },

        apis: {
          baseUrl: "${options.baseUrl}"
        },

        visualPicking: {
          productReferenceType: "SPAREPART"
        }
      }`,
    },
  ];

  return addLibraryFeature(options, {
    folderName: EPD_VISUALIZATION_FOLDER_NAME,
    moduleName: EPD_VISUALIZATION_MODULE_NAME,
    featureModule: {
      name: EPD_VISUALIZATION_MODULE,
      importPath: SPARTACUS_EPD_VISUALIZATION,
    },
    rootModule: {
      name: EPD_VISUALIZATION_ROOT_MODULE,
      importPath: SPARTACUS_EPD_VISUALIZATION_ROOT,
    },
    lazyLoadingChunk: {
      moduleSpecifier: SPARTACUS_EPD_VISUALIZATION_ROOT,
      namedImports: [EPD_VISUALIZATION_FEATURE_NAME_CONSTANT],
    },
    i18n: {
      resources: EPD_VISUALIZATION_TRANSLATIONS,
      chunks: EPD_VISUALIZATION_TRANSLATION_CHUNKS_CONFIG,
      importPath: SPARTACUS_EPD_VISUALIZATION_ASSETS,
    },
    styles: {
      scssFileName: SCSS_FILE_NAME,
      importStyle: SPARTACUS_EPD_VISUALIZATION,
    },
    customConfig,
    dependencyManagement: {
      featureName: CLI_EPD_VISUALIZATION_FEATURE,
      featureDependencies: {},
    },
  });
}

function updateTsConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsconfigString = (tree.read(TSConfigFileName) as Buffer).toString();
    const tsconfig: any = parse(tsconfigString as string);

    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    tsconfig.compilerOptions.skipLibCheck = true;
    const updatedTsConfigString = stringify(tsconfig, null, 2);

    tree.overwrite(TSConfigFileName, updatedTsConfigString);
  };
}