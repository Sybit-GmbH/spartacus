import {
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Injectable,
} from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  EpdVisualizationConfig,
  Ui5Config,
  VisualizationApiConfig,
} from '@spartacus/epd-visualization/root';
import { SceneNodeToProductLookupService } from '@spartacus/epd-visualization/root';
import { VisualizationLookupService } from '@spartacus/epd-visualization/root';

// @ts-ignore
import * as ui5 from '@sapui5/ts-types-esm';

import type Core from 'sap/ui/core/Core';
import type { CSSColor } from 'sap/ui/core/library';

import type Scene from 'sap/ui/vk/Scene';
import type Viewport from 'sap/ui/vk/Viewport';
import type ContentConnector from 'sap/ui/vk/ContentConnector';
import type AnimationPlayer from 'sap/ui/vk/AnimationPlayer';
import type DrawerToolbar from 'sap/ui/vk/DrawerToolbar';
import type ViewStateManager from 'sap/ui/vk/ViewStateManager';
type ViewManager = any;
type NodeRef = any;
import type UIArea from 'sap/ui/core/UIArea';
import type ContentResource from 'sap/ui/vk/ContentResource';

import { NavigationMode } from './models/navigation-mode';
import { SelectionMode } from './models/selection-mode';
import { NodeContentType } from './models/node-content-type';
import { SceneLoadState } from './models/scene-load-state';
import { LoadedSceneInfo, SceneLoadInfo } from './models/scene-load-info';
import { ContentType } from '@spartacus/epd-visualization/root';
import NodeHierarchy from 'sap/ui/vk/NodeHierarchy';
import { catchError, filter, mergeMap, shareReplay } from 'rxjs/operators';
import { VisualizationInfo } from '@spartacus/epd-visualization/root';
import {
  VisualizationLoadInfo,
  VisualizationLoadStatus,
  VisualizationLookupResult,
} from './models/visualization-load-info';
import { ZoomTo } from './models/zoom-to';

interface VisualContentChangesFinishedEvent {
  content: any;
  failureReason: any;
}

interface VisualContentLoadFinishedEvent {}

@Injectable({
  providedIn: 'any',
})
export class VisualViewerService {
  constructor(
    protected epdVisualizationConfig: EpdVisualizationConfig,
    protected _sceneNodeToProductLookupService: SceneNodeToProductLookupService,
    protected visualizationLookupService: VisualizationLookupService,
    protected elementRef: ElementRef,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    const ui5BootStrapped$: Observable<void> =
      this.bootstrapUi5('ui5bootstrap');
    const ui5Initialized$: Observable<void> = ui5BootStrapped$.pipe(
      mergeMap(this.initializeUi5.bind(this))
    );
    this.viewportAdded$ = ui5Initialized$.pipe(
      mergeMap(this.addViewport.bind(this)),
      shareReplay()
    );
    this.executeWhenSceneLoaded(this.setInitialPropertyValues.bind(this));
  }

  protected _ui5: ui5;

  private get sceneNodeToProductLookupService(): SceneNodeToProductLookupService {
    return this._sceneNodeToProductLookupService;
  }
  private set sceneNodeToProductLookupService(
    value: SceneNodeToProductLookupService
  ) {
    this._sceneNodeToProductLookupService = value;
  }

  private _scene: Scene;
  private get scene(): Scene {
    return this._scene;
  }
  private set scene(value: Scene) {
    this._scene = value;
  }

  private _nodeHierarchy: NodeHierarchy;
  private get nodeHierarchy(): NodeHierarchy {
    return this._nodeHierarchy;
  }
  private set nodeHierarchy(value: NodeHierarchy) {
    this._nodeHierarchy = value;
  }

  private _contentConnector: ContentConnector;
  private get contentConnector(): ContentConnector {
    return this._contentConnector;
  }
  private set contentConnector(value: ContentConnector) {
    this._contentConnector = value;
  }

  private _viewport: Viewport;
  private get viewport(): Viewport {
    return this._viewport;
  }
  private set viewport(value: Viewport) {
    this._viewport = value;
  }

  private _viewStateManager: ViewStateManager;
  private get viewStateManager(): ViewStateManager {
    return this._viewStateManager;
  }
  private set viewStateManager(value: ViewStateManager) {
    this._viewStateManager = value;
  }

  private _animationPlayer: AnimationPlayer;
  private get animationPlayer(): AnimationPlayer {
    return this._animationPlayer;
  }
  private set animationPlayer(value: AnimationPlayer) {
    this._animationPlayer = value;
  }

  private _viewManager: ViewManager;
  private get viewManager(): ViewManager {
    return this._viewManager;
  }
  private set viewManager(value: ViewManager) {
    this._viewManager = value;
  }

  private _drawerToolbar: DrawerToolbar;
  private get drawerToolbar(): DrawerToolbar {
    return this._drawerToolbar;
  }
  private set drawerToolbar(value: DrawerToolbar) {
    this._drawerToolbar = value;
  }

  private _sceneId: string;
  private get sceneId(): string {
    return this._sceneId;
  }
  private set sceneId(value: string) {
    this._sceneId = value;
  }

  private _contentType: ContentType;
  private get contentType(): ContentType {
    return this._contentType;
  }
  private set contentType(value: ContentType) {
    this._contentType = value;
  }

  private _initialViewInfo: any;
  private get initialViewInfo(): any {
    return this._initialViewInfo;
  }
  private set initialViewInfo(value: any) {
    this._initialViewInfo = value;
  }

  private _leafNodeRefs: NodeRef[];
  private get leafNodeRefs(): NodeRef[] {
    return this._leafNodeRefs;
  }
  private set leafNodeRefs(value: NodeRef[]) {
    this._leafNodeRefs = value;
  }

  private _viewPriorToIsolateViewInfo: any;
  private get viewPriorToIsolateViewInfo(): any {
    return this._viewPriorToIsolateViewInfo;
  }
  private set viewPriorToIsolateViewInfo(value: any) {
    this._viewPriorToIsolateViewInfo = value;
  }

  private _viewportAdded$: Observable<void>;
  private get viewportAdded$(): Observable<void> {
    return this._viewportAdded$;
  }
  private set viewportAdded$(value: Observable<void>) {
    this._viewportAdded$ = value;
  }

  private _selectedNodeIds$ = new BehaviorSubject<string[]>([]);
  private get selectedNodeIds$() {
    return this._selectedNodeIds$;
  }
  private set selectedNodeIds$(value) {
    this._selectedNodeIds$ = value;
  }

  private _sceneLoadInfo$ = new BehaviorSubject<SceneLoadInfo>({
    sceneLoadState: SceneLoadState.NotStarted,
  });
  public get sceneLoadInfo$() {
    return this._sceneLoadInfo$;
  }

  protected readonly DEFAULT_BACKGROUND_TOP_COLOR = '--cx-color-inverse';
  protected readonly DEFAULT_BACKGROUND_BOTTOM_COLOR = '--cx-color-inverse';
  protected readonly DEFAULT_HOTSPOT_SELECTION_HIGHLIGHT_COLOR =
    'rgba(255, 0, 0, 0.6)';
  protected readonly DEFAULT_SHOW_ALL_HOTSPOTS_COLOR = 'rgba(255, 255, 0, 0.3)';
  protected readonly DEFAULT_OUTLINE_COLOR = 'red';
  protected readonly DEFAULT_OUTLINE_WIDTH = 5;
  protected readonly DEFAULT_SELECTION_MODE = SelectionMode.Exclusive;
  protected readonly DEFAULT_SHOW_ALL_HOTSPOTS_ENABLED = false;
  protected readonly DEFAULT_EXCLUDED_OPACITY = 0.2;
  protected readonly DEFAULT_ZOOM_TO_MARGIN = 0.2;
  protected readonly DEFAULT_FLY_TO_DURATION = 1;

  private _flyToDurationInSeconds = this.DEFAULT_FLY_TO_DURATION;
  private get flyToDurationInSeconds() {
    return this._flyToDurationInSeconds;
  }
  private set flyToDurationInSeconds(value) {
    this._flyToDurationInSeconds = value;
  }
  private _zoomToMargin = this.DEFAULT_ZOOM_TO_MARGIN;
  private get zoomToMargin() {
    return this._zoomToMargin;
  }
  private set zoomToMargin(value) {
    this._zoomToMargin = value;
  }

  /**
   * The top colour of the background gradient.
   * Can be passed in the CSS color format or as a Spartacus theme color i.e. '--cx-color-background' with the quotes.
   */
  @Input()
  public set backgroundTopColor(backgroundTopColor: string) {
    if (this._backgroundTopColor === backgroundTopColor) {
      return;
    }
    this._backgroundTopColor = backgroundTopColor;
    this.executeWhenSceneLoaded(() => {
      this.viewport.setBackgroundColorTop(this.getCSSColor(backgroundTopColor));
    });
  }
  public get backgroundTopColor(): string {
    return this._backgroundTopColor;
  }
  private _backgroundTopColor: string;

  /**
   * The bottom colour of the background gradient.
   * Can be passed in the CSS color format or as a Spartacus theme color i.e. '--cx-color-background' with the quotes.
   */
  @Input()
  public set backgroundBottomColor(backgroundBottomColor: string) {
    if (this._backgroundBottomColor === backgroundBottomColor) {
      return;
    }
    this._backgroundBottomColor = backgroundBottomColor;
    this.executeWhenSceneLoaded(() => {
      this.viewport.setBackgroundColorBottom(
        this.getCSSColor(backgroundBottomColor)
      );
    });
  }
  public get backgroundBottomColor(): string {
    return this._backgroundBottomColor;
  }
  private _backgroundBottomColor: string;

  /**
   * The colour applied to selected 2D hotspots in 2D content.
   * Can be passed in the CSS color format or as a Spartacus theme color i.e. '--cx-color-primary' with the quotes.
   */
  @Input()
  public set hotspotSelectionColor(hotspotSelectionColor: string) {
    if (this._hotspotSelectionColor === hotspotSelectionColor) {
      return;
    }
    this._hotspotSelectionColor = hotspotSelectionColor;
    this.executeWhenSceneLoaded(() => {
      this.viewStateManager.setHighlightColor(
        this.getCSSColor(hotspotSelectionColor)
      );
    });
  }
  public get hotspotSelectionColor(): string {
    return this._hotspotSelectionColor;
  }
  private _hotspotSelectionColor: string;

  /**
   * Highlights all hotspots in 2D content that are included in the includedProductCodes property using the colour specified by the showAllHotspotsColor property.
   */
  @Input()
  public set showAllHotspotsEnabled(showAllHotspotsEnabled: boolean) {
    if (this._showAllHotspotsEnabled === showAllHotspotsEnabled) {
      return;
    }
    this._showAllHotspotsEnabled = showAllHotspotsEnabled;
    this.executeWhenSceneLoaded(() => {
      this.applyInclusionStyle(this._includedProductCodes);
    });
  }
  public get showAllHotspotsEnabled(): boolean {
    return this._showAllHotspotsEnabled;
  }
  private _showAllHotspotsEnabled: boolean;

  /**
   * The colour used to highlight hotspots in 2D content when the showAllHotspotsEnabled property has a value of true.
   * Can be passed in the CSS color format or as a Spartacus theme color i.e. '--cx-color-primary' with the quotes.
   */
  @Input()
  public set showAllHotspotsColor(showAllHotspotsColor: string) {
    if (this._showAllHotspotsColor === showAllHotspotsColor) {
      return;
    }
    this._showAllHotspotsColor = showAllHotspotsColor;
    this.executeWhenSceneLoaded(() => {
      const cssColor = this.getCSSColor(showAllHotspotsColor);
      this.viewport.setShowAllHotspotsTintColor(cssColor);
    });
  }
  public get showAllHotspotsColor(): string {
    return this._showAllHotspotsColor;
  }
  private _showAllHotspotsColor: string;

  /**
   * The outline colour used to indicate selected objects in 3D content.
   * Can be passed in the CSS color format or as a Spartacus theme color i.e. '--cx-color-primary' with the quotes.
   */
  @Input()
  public set outlineColor(outlineColor: string) {
    if (this._outlineColor === outlineColor) {
      return;
    }
    this._outlineColor = outlineColor;
    this.executeWhenSceneLoaded(() => {
      this.viewStateManager.setOutlineColor(this.getCSSColor(outlineColor));
    });
  }
  public get outlineColor(): string {
    return this._outlineColor;
  }
  private _outlineColor: string;

  /**
   * The width of the outline used to indicate selected objects in 3D content.
   */
  @Input()
  public set outlineWidth(outlineWidth: number) {
    if (this._outlineWidth === outlineWidth) {
      return;
    }
    this._outlineWidth = outlineWidth;
    this.executeWhenSceneLoaded(() => {
      this.viewStateManager.setOutlineWidth(outlineWidth);
    });
  }
  public get outlineWidth(): number {
    return this._outlineWidth;
  }
  private _outlineWidth: number;

  /**
   * The selection mode.
   * None - Selection is disabled.
   * Exclusive - When selecting objects in the viewport, at most one object can be selected at a time. Clicking/tapping to select a new object will deselect any previously selected objects.
   * Sticky - A multiple selection mode in which clicking/tapping on an object that is not part of the current selection will toggle its selection state without modifying the selection state of the currently selected objects.
   */
  @Input()
  public set selectionMode(selectionMode: SelectionMode) {
    if (this._selectionMode === selectionMode) {
      return;
    }
    this._selectionMode = selectionMode;
    this.executeWhenSceneLoaded(() => {
      this.viewport.setSelectionMode(selectionMode);
    });
  }
  public get selectionMode(): SelectionMode {
    return this._selectionMode;
  }
  private _selectionMode: SelectionMode;

  /**
   * Gets/sets the selection in terms of product codes.
   * Gets the set of product codes applied to the selected scene nodes.
   * Sets the selection set based on the set of supplied product codes.
   */
  @Input()
  public set selectedProductCodes(selectedProductCodes: string[]) {
    this._selectedProductCodes = selectedProductCodes;
    this.sceneNodeToProductLookupService
      .lookupNodeIds(selectedProductCodes)
      .subscribe((selectedNodeIds) =>
        this.selectedNodeIds$.next(selectedNodeIds)
      );
  }
  public get selectedProductCodes(): string[] {
    return this._selectedProductCodes;
  }
  private _selectedProductCodes: string[];
  @Output() selectedProductCodesChange = new EventEmitter<string[]>();

  /**
   * Gets/sets which objects should be selectable (in terms of product codes).
   * For 3D content:
   * - objects that are included will be selectable and opaque
   * - objects that are not included will not be selectable and will have an opacity specified by the excludedOpacity property.
   *
   * For 2D content:
   * - hotspots that are included will be selectable and can be made visible
   * - hotspots that are not included will not be selectable or visible
   */
  @Input()
  public set includedProductCodes(includedProductCodes: string[]) {
    this._includedProductCodes = includedProductCodes;
    this.executeWhenSceneLoaded(() => {
      this.applyInclusionStyle(includedProductCodes);
    });
  }
  public get includedProductCodes(): string[] {
    return this._includedProductCodes;
  }
  private _includedProductCodes: string[];

  /**
   * Gets/sets the opacity to apply to 3D objects that are not in the set specified by the includedProductCodes property.
   */
  @Input()
  public set excludedOpacity(excludedOpacity: number) {
    this._excludedOpacity = excludedOpacity;
  }
  public get excludedOpacity(): number {
    return this._excludedOpacity;
  }
  private _excludedOpacity: number = this.DEFAULT_EXCLUDED_OPACITY;

  /**
   * The current time position in seconds in the animation (if there is one).
   */
  @Input()
  public set animationTime(animationTime: number) {
    this._animationTime = animationTime;
  }
  public get animationTime(): number {
    return this._animationTime;
  }
  private _animationTime: number;
  @Output() animationTimeChange = new EventEmitter<number>();

  /**
   * The total duration of the animation in seconds.
   * Returns 0 when there is no animation present (or when a scene has not been loaded).
   */
  public get animationTotalDuration(): number {
    if (this.animationPlayer) {
      return this.animationPlayer.getTotalDuration();
    }
    return 0;
  }

  /**
   * The animation playback position as a fractional value between 0 (start) and 1 (end).
   */
  @Input()
  public set animationPosition(position: number) {
    if (this._animationPosition === position) {
      return;
    }
    this._animationPosition = position;
    this.executeWhenSceneLoaded(() => {
      const time = position * this.animationPlayer.getTotalDuration();
      this.animationPlayerSetTime(time, false);
    });
  }
  public get animationPosition(): number {
    return this._animationPosition;
  }
  private _animationPosition: number = 0;
  @Output() animationPositionChange = new EventEmitter<number>();

  /**
   * Gets/sets whether the animation (if there is one) is currently playing.
   */
  @Input()
  public set animationPlaying(animationPlaying: boolean) {
    if (this._animationPlaying === animationPlaying) {
      return;
    }
    this._animationPlaying = animationPlaying;
    this.executeWhenSceneLoaded(() => {
      if (animationPlaying) {
        if (this.animationPosition >= 1) {
          this.animationPlayerSetTime(0, false);
        }
        this.animationPlayer.play();
      } else {
        this.animationPlayer.stop();
      }
      this.animationPlayingChange.emit(animationPlaying);
    });
  }
  public get animationPlaying(): boolean {
    return this._animationPlaying;
  }
  private _animationPlaying: boolean = false;
  @Output() animationPlayingChange = new EventEmitter<boolean>();

  /**
   * Controls the behaviour when a left mouse button drag is initiated in the viewport.
   * Turntable: A left mouse drag performs a turntable mode rotation.
   * Pan: A left mouse drag pans the camera in the viewport.
   * Zoom: A left mouse drag zooms the camera in the viewport in or out
   */
  @Input()
  public set navigationMode(navigationMode: NavigationMode) {
    if (this._navigationMode === navigationMode) {
      return;
    }

    this._navigationMode = navigationMode;
    this.executeWhenSceneLoaded(() => {
      if (this.drawerToolbar && this.viewport) {
        // sap.ui.vk library will have a public API to set the navigation mode in a future UI5 version
        (this.drawerToolbar as any)._activateGesture(
          (this.viewport as any).getImplementation(),
          navigationMode
        );
      }
    });
  }
  public get navigationMode(): NavigationMode {
    return this._navigationMode;
  }
  private _navigationMode: NavigationMode;

  /**
   * Isolate mode allows a single object to be viewed in isolation.
   */
  @Input()
  public set isolateModeEnabled(isolateModeEnabled: boolean) {
    if (this._isolateModeEnabled === isolateModeEnabled) {
      return;
    }

    this.executeWhenSceneLoaded(() => {
      this._isolateModeEnabled = isolateModeEnabled;
      if (isolateModeEnabled) {
        this.viewPriorToIsolateViewInfo = this.viewport.getViewInfo({
          camera: true,
          visibility: true,
        });

        const selectedNodeRefs: NodeRef[] = [];
        if (this.is2D) {
          this.viewStateManager.enumerateSelection((nodeRef: NodeRef) =>
            selectedNodeRefs.push(nodeRef)
          );
        } else {
          this.viewStateManager.enumerateOutlinedNodes((nodeRef: NodeRef) =>
            selectedNodeRefs.push(nodeRef)
          );
        }

        this.isolateNodes(selectedNodeRefs);
      } else {
        this.viewport.setViewInfo(
          this.viewPriorToIsolateViewInfo,
          this.flyToDurationInSeconds
        );
      }

      this.isolateModeEnabledChange.emit(this.isolateModeEnabled);
    });
  }
  public get isolateModeEnabled(): boolean {
    return this._isolateModeEnabled;
  }
  private _isolateModeEnabled = false;
  @Output() isolateModeEnabledChange = new EventEmitter<boolean>();

  /**
   * Gets whether the viewport is displaying 2D content.
   */
  public get is2D(): boolean {
    return this._is2D;
  }
  private setIs2D(is2D: boolean) {
    this._is2D = is2D;
  }
  private _is2D: boolean;

  /**
   * Indicates that a scene has been loaded and the viewport is ready for interaction.
   */
  public get viewportReady(): boolean {
    return this._viewportReady;
  }
  private setViewportReady(viewportReady: boolean) {
    if (this._viewportReady === viewportReady) {
      return;
    }
    this._viewportReady = viewportReady;
    this.viewportReadyChange.emit(viewportReady);
  }
  private _viewportReady = false;
  @Output() viewportReadyChange = new EventEmitter<boolean>();

  /**
   * Returns the user to the initial camera position used when a scene was first loaded.
   */
  public activateHomeView(): void {
    if (this.is2D) {
      this.viewport.zoomTo(
        ZoomTo.All,
        null,
        this.flyToDurationInSeconds,
        this.zoomToMargin
      );
    } else {
      this.viewport.setViewInfo(
        this.initialViewInfo,
        this.flyToDurationInSeconds
      );
    }

    if (this.isolateModeEnabled) {
      // Exit out of the isolate mode but don't restore the view that was
      // saved before entering isolate mode
      this._isolateModeEnabled = false;
      this.isolateModeEnabledChange.emit(false);
    }
  }

  /**
   * Plays the animation (if one exists).
   */
  public playAnimation(): void {
    this.animationPlaying = true;
  }

  /**
   * Pauses animation playback.
   */
  public pauseAnimation(): void {
    this.animationPlaying = false;
  }

  private contentChangesFinished =
    new EventEmitter<VisualContentChangesFinishedEvent>();

  private contentLoadFinished =
    new EventEmitter<VisualContentLoadFinishedEvent>();

  private setInitialPropertyValues(): void {
    if (this.backgroundTopColor === undefined) {
      this.backgroundTopColor = this.DEFAULT_BACKGROUND_TOP_COLOR;
    }

    if (this.backgroundBottomColor === undefined) {
      this.backgroundBottomColor = this.DEFAULT_BACKGROUND_BOTTOM_COLOR;
    }

    if (this.hotspotSelectionColor === undefined) {
      this.hotspotSelectionColor =
        this.DEFAULT_HOTSPOT_SELECTION_HIGHLIGHT_COLOR;
    }

    if (this.showAllHotspotsColor === undefined) {
      this.showAllHotspotsColor = this.DEFAULT_SHOW_ALL_HOTSPOTS_COLOR;
    }

    if (this.outlineColor === undefined) {
      this.outlineColor = this.DEFAULT_OUTLINE_COLOR;
    }

    if (this.outlineWidth === undefined) {
      this.outlineWidth = this.DEFAULT_OUTLINE_WIDTH;
    }

    if (this.selectionMode === undefined) {
      this.selectionMode = this.DEFAULT_SELECTION_MODE;
    }

    if (this.showAllHotspotsEnabled === undefined) {
      this.showAllHotspotsEnabled = this.DEFAULT_SHOW_ALL_HOTSPOTS_ENABLED;
    }

    if (this.is2D) {
      if (
        this.navigationMode === undefined ||
        this.navigationMode === NavigationMode.Turntable
      ) {
        this.navigationMode = NavigationMode.Pan;
      }
    } else if (this.navigationMode === undefined) {
      this.navigationMode = NavigationMode.Turntable;
    }

    if (this.selectedProductCodes === undefined) {
      this.selectedProductCodes = this.selectedNodeIds$.getValue();
    }
  }

  protected executeWhenSceneLoaded(
    callback: (loadedSceneInfo: LoadedSceneInfo) => void
  ): void {
    this.sceneLoadInfo$
      .pipe(
        filter(
          (sceneLoadInfo) =>
            sceneLoadInfo.sceneLoadState === SceneLoadState.Loaded
        )
      )
      .subscribe((sceneLoadInfo: SceneLoadInfo) => {
        callback(sceneLoadInfo.loadedSceneInfo as LoadedSceneInfo);
      });
  }

  private applyInclusionStyle(productCodes: string[]): void {
    if (productCodes === undefined) {
      return;
    }

    this.sceneNodeToProductLookupService
      .lookupNodeIds(productCodes)
      .subscribe((sceneNodeIds: string[]) => {
        const nodeRefsToInclude = this.persistentIdToNodeRef(sceneNodeIds);
        if (this.is2D) {
          const hotspotNodeRefs: NodeRef[] =
            this.nodeHierarchy.getHotspotNodeIds();
          if (this._showAllHotspotsEnabled) {
            const nodeRefsToIncludeSet = new Set();
            nodeRefsToInclude.forEach((nodeRef: NodeRef) =>
              nodeRefsToIncludeSet.add(nodeRef)
            );
            const nodeRefsToExclude: NodeRef[] = hotspotNodeRefs.filter(
              (nodeRef: NodeRef) => !nodeRefsToIncludeSet.has(nodeRef)
            );
            this.viewport.showHotspots(nodeRefsToExclude, false, null);
            this.viewport.showHotspots(
              nodeRefsToInclude,
              true,
              this.getCSSColor(this._showAllHotspotsColor)
            );
          } else {
            this.viewport.showHotspots(hotspotNodeRefs, false, null);
          }
        } else {
          if (!this.leafNodeRefs) {
            this.leafNodeRefs = this.getAllLeafNodeRefs();
          }

          const leafNodeRefsToInclude = nodeRefsToInclude.flatMap(
            (nodeRef: NodeRef) => this.getLeafDescendants(nodeRef, [])
          );
          const leafNodeRefsToIncludeSet = new Set();
          leafNodeRefsToInclude.forEach((nodeRef: NodeRef) =>
            leafNodeRefsToIncludeSet.add(nodeRef)
          );

          const leafNodeRefsToExclude = this.leafNodeRefs.filter(
            (leafNodeRef: NodeRef) => !leafNodeRefsToIncludeSet.has(leafNodeRef)
          );

          this.viewStateManager.setOpacity(
            leafNodeRefsToExclude,
            this.excludedOpacity
          );
          leafNodeRefsToInclude.forEach((nodeRef: NodeRef) =>
            this.viewStateManager.restoreRestOpacity(nodeRef)
          );
        }
      });
  }

  private getLeafDescendants(
    nodeRef: NodeRef,
    leafNodeRefs: NodeRef[]
  ): NodeRef[] {
    const children = this.nodeHierarchy.getChildren(nodeRef, false);
    if (children.length === 0) {
      leafNodeRefs.push(nodeRef);
    } else {
      children.forEach((childNodeRef) =>
        this.getLeafDescendants(childNodeRef, leafNodeRefs)
      );
    }
    return leafNodeRefs;
  }

  private getAllLeafNodeRefs(): NodeRef[] {
    return this.nodeHierarchy
      .getChildren(undefined)
      .flatMap((nodeRef) => this.getLeafDescendants(nodeRef, []));
  }

  private isolateNodes(nodeRefsToIsolate: object[]): void {
    // isolate just the first selected node
    nodeRefsToIsolate = nodeRefsToIsolate.slice(0, 1);

    this.viewport.zoomTo(
      ZoomTo.Node,
      nodeRefsToIsolate,
      this.flyToDurationInSeconds,
      this.zoomToMargin
    );

    const currentVisibleSids: string[] =
      this.viewPriorToIsolateViewInfo.visibility.visible || [];
    const currentVisibleNodeRefs = currentVisibleSids.map(
      this.persistentIdToNodeRef.bind(this)
    );
    this.viewStateManager.setVisibilityState(
      currentVisibleNodeRefs,
      false,
      true,
      false
    );
    this.viewStateManager.setVisibilityState(
      nodeRefsToIsolate,
      true,
      true,
      true
    );
  }

  private animationPlayerSetTime(time: number, blockEvents: boolean): void {
    // bug workaround
    // the overload with no sequence number parameter blows up
    (this.animationPlayer as any).setTime(time, undefined, blockEvents);
  }

  private onViewActivated(): void {
    this.initialViewInfo = this.viewport.getViewInfo({
      camera: true,
      visibility: true,
    });
  }

  private onTimeChanged(oEvent: any): void {
    let changes = false;

    const time: number = oEvent.getParameters().time;
    if (this.animationTime !== time) {
      this.animationTime = time;
      this.animationTimeChange.emit(time);
      changes = true;
    }

    const position = this.animationTotalDuration
      ? this.animationTime / this.animationTotalDuration
      : 0;
    if (this.animationPosition !== position) {
      this.animationPosition = position;
      this.animationPositionChange.emit(position);
      changes = true;
    }

    if (this.animationPlaying) {
      if (this.animationPosition >= 1) {
        this._animationPlaying = false;
        this.animationPlayingChange.emit(this._animationPlaying);
      }
    }

    if (changes) {
      // This is needed for the animation slider handle position to get updated
      // while an animation is playing.
      // Otherwise it typically only moves once the animation playback has paused.
      this.changeDetectorRef.detectChanges();
    }
  }

  private setVisualizationLoadInfo(
    visualizationLoadInfo: VisualizationLoadInfo
  ) {
    this._visualizationLoadInfo = visualizationLoadInfo;
    this.visualizationLoadInfoChange.emit(visualizationLoadInfo);
    this.changeDetectorRef.detectChanges();
  }
  public get visualizationLoadInfo(): VisualizationLoadInfo {
    return this._visualizationLoadInfo;
  }
  private _visualizationLoadInfo: VisualizationLoadInfo;
  public visualizationLoadInfoChange =
    new EventEmitter<VisualizationLoadInfo>();

  public loadVisualization(
    productCode: string
  ): Observable<VisualizationLoadInfo> {
    return this.viewportAdded$.pipe(
      mergeMap(() =>
        this.resolveVisualization(productCode).pipe(
          mergeMap((visualizationLoadInfo: VisualizationLoadInfo) => {
            if (
              visualizationLoadInfo.lookupResult ===
              VisualizationLookupResult.UniqueMatchFound
            ) {
              this.sceneNodeToProductLookupService.populateMapsForScene(
                this.sceneId
              );

              let mergedVisualizationLoadInfo: VisualizationLoadInfo = {
                ...visualizationLoadInfo,
                loadStatus: VisualizationLoadStatus.Loading,
              };
              this.setVisualizationLoadInfo(mergedVisualizationLoadInfo);

              return this.loadScene(this.sceneId, this.contentType).pipe(
                mergeMap((sceneLoadInfo: SceneLoadInfo) => {
                  if (sceneLoadInfo.sceneLoadState === SceneLoadState.Failed) {
                    mergedVisualizationLoadInfo = {
                      ...visualizationLoadInfo,
                      loadStatus: VisualizationLoadStatus.UnexpectedError,
                      errorMessage: sceneLoadInfo.errorMessage,
                    };
                  } else {
                    this.subscribeSelectedSceneNodeIds();
                    mergedVisualizationLoadInfo = {
                      ...visualizationLoadInfo,
                      loadStatus: VisualizationLoadStatus.Loaded,
                    };
                  }
                  this.setVisualizationLoadInfo(mergedVisualizationLoadInfo);
                  return of(mergedVisualizationLoadInfo);
                })
              );
            } else {
              return of(visualizationLoadInfo);
            }
          })
        )
      )
    );
  }

  private isUi5BootStrapped(): boolean {
    return !!window.sap;
  }

  private getCore(): Core {
    return sap.ui.getCore();
  }

  private bootstrapUi5(scriptElementId: string): Observable<void> {
    return new Observable((subscriber) => {
      if (this.isUi5BootStrapped()) {
        subscriber.next();
        subscriber.complete();
        return;
      }

      const script = document.createElement('script');
      script.setAttribute('id', scriptElementId);
      document.getElementsByTagName('head')[0].appendChild(script);
      script.onload = () => {
        subscriber.next();
        subscriber.complete();
      };
      script.onerror = (error: any) => {
        subscriber.error(error);
        subscriber.complete();
      };
      script.id = 'sap-ui-bootstrap';
      script.type = 'text/javascript';
      script.setAttribute('data-sap-ui-compatVersion', 'edge');
      script.src = (this.epdVisualizationConfig.ui5 as Ui5Config).bootstrapUrl;
    });
  }

  private initializeUi5(): Observable<void> {
    return new Observable((subscriber) => {
      const core: Core = this.getCore();
      core.attachInit(() => {
        const loadLibraryOptions = { async: true };
        Promise.all([
          core.loadLibrary('sap.m', loadLibraryOptions),
          core.loadLibrary('sap.ui.layout', loadLibraryOptions),
          core.loadLibrary('sap.ui.vk', loadLibraryOptions),
          core.loadLibrary('sap.ui.richtexteditor', loadLibraryOptions),
        ]).then(() => {
          subscriber.next();
          subscriber.complete();
        });
      });
    });
  }

  private destroyViewportAssociations(viewport: Viewport): void {
    const core = this.getCore();
    if (!core) {
      return;
    }

    const contentConnectorId = viewport.getContentConnector();
    if (contentConnectorId) {
      const contentConnector = core.byId(contentConnectorId);
      if (contentConnector) {
        contentConnector.destroy();
      }
    }

    const viewStateManagerId = viewport.getViewStateManager();

    if (viewStateManagerId && core.byId(viewStateManagerId)) {
      const viewStateManager = core.byId(
        viewStateManagerId
      ) as ViewStateManager;

      if (viewStateManager) {
        const animationPlayer = viewStateManager.getAnimationPlayer();
        if (animationPlayer) {
          animationPlayer.destroy();
        }

        const viewManagerId = viewStateManager.getViewManager();
        if (viewManagerId) {
          const viewManager = core.byId(viewManagerId);
          if (viewManager) {
            viewManager.destroy();
          }
        }
        viewStateManager.destroy();
      }
    }
  }

  private onContentChangesStarted(): void {
    this.viewport.detachNodesPicked(this.onNodesPicked);
  }

  private onContentChangesFinished(event: any): void {
    const content = event.getParameter('content');
    const failureReason = event.getParameter('failureReason');
    if (!!content && !failureReason) {
      this.scene = content;
      this.nodeHierarchy = this.scene.getDefaultNodeHierarchy();

      this.viewport.attachNodesPicked(this.onNodesPicked, this);

      if (content.loaders) {
        content.loaders.forEach((contentLoader: any) => {
          if (
            contentLoader &&
            contentLoader.attachLoadingFinished !== undefined
          ) {
            contentLoader.attachLoadingFinished(
              this.onContentLoadingFinished,
              this
            );
          }
        });
      }
    }
    this.contentChangesFinished.emit({
      content: content,
      failureReason: failureReason,
    });
  }

  private onContentLoadingFinished(_event: any): void {
    this.contentLoadFinished.emit({});
  }

  private onNodesPicked(event: any): void {
    if (this.is2D) {
      this.onNodesPicked2D(event);
    } else {
      this.onNodesPicked3D(event);
    }
  }

  private isNodeIncluded(nodeRef: NodeRef): boolean {
    const sid = this.nodeRefToPersistentId(nodeRef);
    if (!sid) {
      return false;
    }
    const productCodes =
      this.sceneNodeToProductLookupService.syncLookupProductCodes([
        sid as string,
      ]);
    return (
      !!productCodes &&
      productCodes.some((productCode: string) =>
        this.includedProductCodes.includes(productCode)
      )
    );
  }

  private onNodesPicked2D(event: any): void {
    const pickedNodes = event.getParameter('picked');
    if (pickedNodes.length === 0) {
      return;
    }

    const hotSpots = pickedNodes.filter(
      (node: any) =>
        node.nodeContentType && node.nodeContentType === NodeContentType.Hotspot
    );
    if (hotSpots.length === 0) {
      return;
    }

    const includedHotSpots: NodeRef[] = hotSpots.filter((nodeRef: NodeRef) =>
      this.isNodeIncluded(nodeRef)
    );

    pickedNodes.splice(0);
    includedHotSpots.forEach((includedHotSpot: any) =>
      pickedNodes.push(includedHotSpot)
    );
  }

  private onNodesPicked3D(event: any): void {
    const picked: NodeRef[] = event.getParameter('picked');
    const src: NodeRef[] = picked.splice(0, picked.length);

    src.forEach((node: NodeRef) => {
      while (!this.isNodeIncluded(node)) {
        node = node.parent;
        if (!node) {
          break;
        }
      }
      if (node) {
        picked.push(node);
      }
    });
  }

  private addViewport(): Observable<void> {
    return new Observable((subscriber) => {
      sap.ui.require(
        [
          'sap/ui/vk/ViewManager',
          'sap/ui/vk/Viewport',
          'sap/ui/vk/ViewStateManager',
          'sap/ui/vk/AnimationPlayer',
          'sap/ui/vk/ContentConnector',
          'sap/ui/vk/DrawerToolbar',
        ],
        (
          ViewManager: ViewManager,
          Viewport: any,
          ViewStateManager: any,
          AnimationPlayer: any,
          ContentConnector: any,
          DrawerToolbar: any
        ) => {
          const core: Core = this.getCore();
          const uiArea: UIArea = core.getUIArea(this.elementRef.nativeElement);
          if (uiArea) {
            const oldViewport = uiArea.getContent()[0] as Viewport;
            this.destroyViewportAssociations(oldViewport);
            uiArea.destroyContent();
          }

          this.viewport = new Viewport({ visible: false });
          this.viewport.placeAt(this.elementRef.nativeElement);

          this.contentConnector = new ContentConnector();
          this.contentConnector.attachContentChangesStarted(
            this.onContentChangesStarted,
            this
          );
          this.contentConnector.attachContentChangesFinished(
            this.onContentChangesFinished,
            this
          );
          this.contentConnector.attachContentLoadingFinished(
            this.onContentLoadingFinished,
            this
          );

          this.viewStateManager = new ViewStateManager({
            contentConnector: this.contentConnector,
          });

          this.viewport.setContentConnector(this.contentConnector);
          this.viewport.setViewStateManager(this.viewStateManager);

          this.animationPlayer = new AnimationPlayer();
          this.animationPlayer.setViewStateManager(this.viewStateManager);

          this.animationPlayer.attachViewActivated(this.onViewActivated, this);
          this.animationPlayer.attachTimeChanged(this.onTimeChanged, this);

          this.viewManager = new ViewManager({
            contentConnector: this.contentConnector,
            animationPlayer: this.animationPlayer,
          });

          this.viewStateManager.setViewManager(this.viewManager);
          this.viewStateManager.attachSelectionChanged(
            this.onSelectionChanged,
            this
          );
          this.viewStateManager.attachOutliningChanged(
            this.onOutliningChanged,
            this
          );

          this.drawerToolbar = new DrawerToolbar({
            viewport: this.viewport,
            visible: false,
          });

          this.viewport.addDependent(this.drawerToolbar);
          subscriber.next();
          subscriber.complete();
        }
      );
    });
  }

  private getCSSPropertyValue(cssPropertyName: string): string {
    const storefrontElement = document.getElementsByTagName('cx-storefront')[0];
    return getComputedStyle(storefrontElement).getPropertyValue(
      cssPropertyName
    );
  }

  private getCSSColor(color: string): CSSColor {
    return (this.getCSSPropertyValue(color) || color).trim() as CSSColor;
  }

  private resolveVisualization(
    productCode: string
  ): Observable<VisualizationLoadInfo> {
    return this.visualizationLookupService
      .findMatchingVisualizations(productCode)
      .pipe(
        mergeMap((matches: VisualizationInfo[]) => {
          let visualizationLoadInfo: VisualizationLoadInfo;
          switch (matches.length) {
            case 0:
              visualizationLoadInfo = {
                lookupResult: VisualizationLookupResult.NoMatchFound,
                loadStatus: VisualizationLoadStatus.NotStarted,
                matches: matches,
              };
              break;
            case 1:
              const matchingVisualization = matches[0];
              this.sceneId = matchingVisualization.sceneId;
              this.contentType = matchingVisualization.contentType;
              visualizationLoadInfo = {
                lookupResult: VisualizationLookupResult.UniqueMatchFound,
                loadStatus: VisualizationLoadStatus.NotStarted,
                matches: matches,
                visualization: matchingVisualization,
              };
              break;
            default:
              visualizationLoadInfo = {
                lookupResult: VisualizationLookupResult.MultipleMatchesFound,
                loadStatus: VisualizationLoadStatus.NotStarted,
                matches: matches,
              };
              break;
          }
          this.setVisualizationLoadInfo(visualizationLoadInfo);
          return of(visualizationLoadInfo);
        }),
        catchError(() => {
          let visualizationLoadInfo = {
            lookupResult: VisualizationLookupResult.UnexpectedError,
            loadStatus: VisualizationLoadStatus.NotStarted,
          };
          this.setVisualizationLoadInfo(visualizationLoadInfo);
          return of(visualizationLoadInfo);
        })
      );
  }

  private persistentIdToNodeRef(
    nodeIds: string | string[]
  ): NodeRef | NodeRef[] {
    return (this.scene as any).persistentIdToNodeRef(nodeIds);
  }

  private nodeRefToPersistentId(
    nodeRefs: object | object[]
  ): string | string[] {
    return (this.scene as any).nodeRefToPersistentId(nodeRefs);
  }

  private getViewStateManagerImplementation(): any {
    return (this.viewStateManager as any).getImplementation();
  }

  private subscribeSelectedSceneNodeIds(): void {
    this.selectedNodeIds$.subscribe(this.handleSelectedNodeIds.bind(this));
  }

  private handleSelectedNodeIds(nodeIds: string[]): void {
    const nodeRefs = this.persistentIdToNodeRef(nodeIds);

    if (this.is2D) {
      this.handleSelectedNodes2D(nodeRefs);
    } else {
      this.handleSelectedNodes3D(nodeRefs);
    }

    if (this.isolateModeEnabled && nodeRefs.length > 0) {
      this.isolateNodes(nodeRefs);
    }
    // Need to ensure a frame render occurs since we are blocking events
    // when changing selection/outlining
    this.setShouldRenderFrame();
  }

  private handleSelectedNodes2D(selectedNodes: NodeRef[]): void {
    const existingSelection: NodeRef[] = [];
    this.viewStateManager.enumerateSelection((nodeRef: NodeRef) =>
      existingSelection.push(nodeRef)
    );
    this.viewStateManager.setSelectionStates(
      [],
      existingSelection,
      false,
      true
    );
    this.viewStateManager.setSelectionStates(selectedNodes, [], false, true);
  }

  private handleSelectedNodes3D(selectedNodes: NodeRef[]): void {
    const existingOutlinedNodeRefs: NodeRef[] = [];
    this.viewStateManager.enumerateOutlinedNodes((nodeRef: NodeRef) =>
      existingOutlinedNodeRefs.push(nodeRef)
    );
    this.getViewStateManagerImplementation().setOutliningStates(
      [],
      existingOutlinedNodeRefs,
      false,
      true
    );
    this.getViewStateManagerImplementation().setOutliningStates(
      selectedNodes,
      [],
      false,
      true
    );
  }

  private setShouldRenderFrame(): void {
    (this.viewport as any).setShouldRenderFrame();
  }

  private is2DContentType(contentType: ContentType): boolean {
    return contentType === ContentType.Drawing2D;
  }

  private loadScene(
    sceneId: string,
    contentType: ContentType
  ): Observable<SceneLoadInfo> {
    if (this.viewportReady) {
      this.setViewportReady(false);
    }

    this.setIs2D(this.is2DContentType(contentType));

    return new Observable((subscriber) => {
      sap.ui.require(['sap/ui/vk/ContentResource'], (ContentResource: any) => {
        this.sceneLoadInfo$.next({
          sceneLoadState: SceneLoadState.Loading,
        });

        this.viewport.setSelectionDisplayMode(
          this.is2D ? 'Highlight' : 'Outline'
        );

        const baseUrl: string = (
          this.epdVisualizationConfig.apis as VisualizationApiConfig
        ).baseUrl;

        const contentResource: ContentResource = new ContentResource({
          useSecureConnection: false,
          sourceType: this.is2D ? 'stream2d' : 'stream',
          source: `${baseUrl}/vis/public/storage/v1`,
          veid: sceneId,
        });

        this.contentChangesFinished.subscribe((visualContentLoadFinished) => {
          const succeeded = !!visualContentLoadFinished.content;
          const sceneLoadInfo: SceneLoadInfo = succeeded
            ? {
                sceneLoadState: SceneLoadState.Loaded,
                loadedSceneInfo: {
                  sceneId: sceneId,
                  contentType: contentType,
                },
              }
            : {
                sceneLoadState: SceneLoadState.Failed,
                errorMessage: visualContentLoadFinished.failureReason,
              };

          this.sceneLoadInfo$.next(sceneLoadInfo);
          subscriber.next(sceneLoadInfo);
          subscriber.complete();
        });

        this.contentLoadFinished.subscribe(() => {
          const sceneLoadInfo = this.sceneLoadInfo$.value;
          if (sceneLoadInfo.sceneLoadState === SceneLoadState.Loaded) {
            this.setViewportReady(true);
            // Ensure that the spinner is hidden before the viewport becomes visible.
            // Otherwise the position of the spinner changes
            this.changeDetectorRef.detectChanges();
            this.viewport.setVisible(true);
          }
        });

        this.contentConnector.addContentResource(contentResource);
      });
    });
  }

  private onSelectionChanged(): void {
    const nodeRefs: NodeRef[] = [];
    this.viewStateManager.enumerateSelection((nodeRef: NodeRef) =>
      nodeRefs.push(nodeRef)
    );

    const nodeIds = this.nodeRefToPersistentId(nodeRefs) as string[];
    this.sceneNodeToProductLookupService
      .lookupProductCodes(nodeIds)
      .subscribe((productCodes: string[]) =>
        this.selectedProductCodesChange.emit(productCodes)
      );
  }

  private onOutliningChanged(): void {
    const nodeRefs: NodeRef[] = [];
    this.viewStateManager.enumerateOutlinedNodes((nodeRef: NodeRef) =>
      nodeRefs.push(nodeRef)
    );

    const nodeIds = this.nodeRefToPersistentId(nodeRefs) as string[];
    this.sceneNodeToProductLookupService
      .lookupProductCodes(nodeIds)
      .subscribe((productCodes: string[]) =>
        this.selectedProductCodesChange.emit(productCodes)
      );
  }
}