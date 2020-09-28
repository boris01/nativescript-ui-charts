import { UIChartsViewBase } from './ui-charts.common';
import { optionsHandler } from './options-handlers/options-handler';

export class UIChartsView extends UIChartsViewBase {
  private _delegate: HighchartsViewDelegateImpl;

  public createNativeView() {
    const chartView = new HIChartView({ frame: CGRectMake(0, 0, 200, 200) }) as any;
    // always retain delegate on owner class to ensure it doesn't inadvertently get garbage collected
    this._delegate = HighchartsViewDelegateImpl.initWithOwner(this);
    chartView.delegate = this._delegate;
    const currentVC = getVisibleViewController();
    chartView.viewController = currentVC;
    return chartView;
  }

  public setOptions(opts: any) {
    this.options = opts;
    const hiOptions = optionsHandler(this.options);
    if (this.nativeViewProtected) {
      this.nativeViewProtected.options = hiOptions;
    }
  }

  public updateOptions(opts) {
    this.options = opts;
    const hiOptions = optionsHandler(this.options);
    if (this.nativeViewProtected) {
      this.nativeViewProtected.updateRedrawOneToOneAnimation(hiOptions, 1, 1, new HIAnimationOptionsObject());
    }
  }

  public setExtremes(newMin: any, newMax: any, xAxisIndex = 0) {
    if (this.nativeViewProtected) {
      const opts = this.nativeViewProtected.options as HIOptions;
      const xaxis = opts.xAxis[xAxisIndex];
      xaxis.min = newMin;
      xaxis.max = newMax;
      this.nativeViewProtected.zoomOut();
      this.nativeViewProtected.updateRedrawOneToOneAnimation(
        this.nativeViewProtected.options,
        1,
        1,
        new HIAnimationOptionsObject()
      );
    }
  }
}

@NativeClass() // native delegates mostly always extend NSObject
class HighchartsViewDelegateImpl extends NSObject implements HIChartViewDelegate {
  private _owner: WeakRef<UIChartsView>;

  static ObjCProtocols = [HIChartViewDelegate]; // define our native protocalls

  static initWithOwner(owner: UIChartsView) {
    const del = <HighchartsViewDelegateImpl>HighchartsViewDelegateImpl.new();
    del._owner = new WeakRef(owner);
    return del;
  }

  chartViewDidLoad(chart) {
    // console.log("HighchartsViewDelegateImpl Did load chart:", chart)
    const owner = this._owner.get();
    if (owner) {
      owner.notify({
        eventName: owner.events.chartLoaded,
        object: owner,
      });
    }
  }
}

function getVisibleViewController(rootViewController?: UIViewController): UIViewController {
  if (!rootViewController) {
    rootViewController = UIApplication.sharedApplication.keyWindow.rootViewController;
  }
  if (rootViewController.presentedViewController) {
    return getVisibleViewController(rootViewController.presentedViewController);
  }

  if (rootViewController.isKindOfClass(UINavigationController.class())) {
    return getVisibleViewController((<UINavigationController>rootViewController).visibleViewController);
  }

  if (rootViewController.isKindOfClass(UITabBarController.class())) {
    return getVisibleViewController(<UITabBarController>rootViewController);
  }

  return rootViewController;
}
