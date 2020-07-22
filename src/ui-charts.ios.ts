import { UIChartsViewBase } from './ui-charts.common';
import { optionsHandler } from './options-handlers/options-handler';

export class UIChartsView extends UIChartsViewBase {

    public onLoaded() {
        super.onLoaded();

        const hiOptions = optionsHandler(this.options);
        console.log(hiOptions);

        (<any>this.nativeView).options = hiOptions;
    }

    public createNativeView() {
        const chartView = new HIChartView({ frame: CGRectMake(0, 0, 200, 200) }) as any;
        chartView.delegate = new HighchartsViewDelegateImpl();
        const currentVC = getVisibleViewController();
        chartView.viewController = currentVC;
        return chartView;
    }

    public onUnloaded() {
        super.onUnloaded();
    }

    public disposeNativeView() {
        super.disposeNativeView();
    }

    /**
     * Initializes properties/listeners of the native view.
     */
    initNativeView(): void {
        // Attach the owner to nativeView.
        // When nativeView is tapped we get the owning JS object through this field.
        (<any>this.nativeView).owner = new WeakRef(this);
        super.initNativeView();

        // NSNotificationCenter.defaultCenter.addObserverForNameObjectQueueUsingBlock("valueChange", null, NSOperationQueue.mainQueue, this.onValueChange);
    }

    public setOptions(opts: any) {
        const nativeview = (<any>this.nativeView);
        nativeview.options = opts;
    }

    public setExtremes(newMin: any, newMax: any, xAxisIndex = 0) {
        const nativeview = (<any>this.nativeView);
        const opts = (nativeview.options as HIOptions);
        const xaxis = opts.xAxis[xAxisIndex];
        xaxis.min = newMin;
        xaxis.max = newMax;
        nativeview.zoomOut();
        nativeview.updateRedrawOneToOneAnimation(nativeview.options, 1, 1, new HIAnimationOptionsObject());
    }
}

class HighchartsViewDelegateImpl
    extends NSObject // native delegates mostly always extend NSObject
    implements HIChartViewDelegate {

    static ObjCProtocols = [HIChartViewDelegate] // define our native protocalls

    static new(): HighchartsViewDelegateImpl {
        return <HighchartsViewDelegateImpl>super.new() // calls new() on the NSObject
    }

    chartViewDidLoad(chart) {
        console.log("HighchartsViewDelegateImpl Did load chart:", chart)
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