
/**
 * Created by cmeyers on 8/18/16.
 */

import { Fetch } from './fetch';
import * as sse from '@jenkins-cd/sse-gateway';
import { RunApi } from './rest/RunApi';

import { SseBus } from './sse/SseBus';
import { ToastService } from './ToastService';
import {
    ActivityService,
    DefaultSSEHandler,
    LocationService,
    Pager,
    PagerService,
    PipelineService,
    SSEService
} from './services/index';
import * as stringUtil from './stringUtil';
import { disableMocksForI18n, enableMocksForI18n } from './i18n/i18n';
import LiveStatusIndicator from './components/LiveStatusIndicator';

// export i18n provider
export i18nTranslator, { defaultLngDetector } from './i18n/i18n';

export logging from './logging';
export loadingIndicator from './LoadingIndicator';

export { Fetch, FetchFunctions } from './fetch';
export UrlBuilder from './UrlBuilder';
export UrlConfig from './urlconfig';
export JWT from './jwt';
export TestUtils from './testutils';
export ToastUtils from './ToastUtils';
export Utils from './utils';
export { User } from './User';
export AppConfig from './config';
export Security from './security';
export Paths from './paths/index';

export { Pager, PagerService, PipelineService, SSEService, ActivityService };

export { stringUtil as StringUtil };

export Fullscreen from './Fullscreen';
export NotFound from './NotFound';

export { ShowMoreButton } from './components/ShowMoreButton';
export { ReplayButton } from './components/ReplayButton';
export { RunButton as RunButtonBase } from './components/RunButton';
export {
    ParametersRunButton as RunButton,
    ParameterService,
    ParameterApi,
    Boolean,
    Choice,
    String,
    Text,
    Password,
    supportedInputTypesMapping,
    ParametersRender,
} from './parameter';
export {
    BlueLogo,
    BlueOceanIcon,
} from './components/BlueLogo';
export { ContentPageHeader, SiteHeader } from './components/ContentPageHeader';
export { ResultPageHeader } from './components/ResultPageHeader';

// Create and export the SSE connection that will be shared by other
// Blue Ocean components via this package.
export const sseConnection = sse.connect('jenkins-blueocean-core-js');

// export services as a singleton so all plugins will use the same instance

// capabilities
export { capable, capabilityStore, capabilityAugmenter } from './capability/index';

// limit to single instance so that duplicate REST calls aren't made as events come in
const sseBus = new SseBus(sseConnection, Fetch.fetchJSON);
export { sseBus as SseBus };

// required so new toasts are routed to the instance used in blueocean-web
const toastService = new ToastService();
export { toastService as ToastService };

const runApi = new RunApi();
export { runApi as RunApi };

export const pagerService = new PagerService();
export const sseService = new SSEService(sseConnection);
export const activityService = new ActivityService(pagerService);
export const pipelineService = new PipelineService(pagerService, activityService);
export const locationService = new LocationService();

const defaultSSEhandler = new DefaultSSEHandler(pipelineService, activityService, pagerService);
sseService.registerHandler(defaultSSEhandler.handleEvents);

// Export some debugging stuff client code may need

export const DEBUG = {
    enableMocksForI18n,
    disableMocksForI18n,
};

export { BunkerService } from './services/BunkerService';
export { TimeManager } from './utils/serverBrowserTimeHarmonize';

export { TimeHarmonizer } from './components/TimeHarmonizer';
export { LiveStatusIndicator };
export {
    buildOrganizationUrl,
    buildPipelineUrl,
    rootPath,
    buildClassicConfigUrl,
    buildClassicInputUrl,
    buildClassicBuildUrl,
    buildRunDetailsUrl,
    doubleUriEncode,
    fetchAllSuffix,
    applyFetchAll,
    calculateFetchAll,
    calculateLogView,
    calculateLogUrl,
    calculateNodeBaseUrl,
    calculateStepsBaseUrl,
    calculateRunLogURLObject,
    paginateUrl,
    endSlash,
    getRestUrl,
    buildUrl,
    relativeUrl,
    toClassicJobPage,
} from './utils/UrlUtils';
