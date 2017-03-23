import React, { Component, PropTypes } from 'react';
import { logging } from '@jenkins-cd/blueocean-core-js';
import { observer } from 'mobx-react';
import { KaraokeService } from '../index';
import LogConsole from './LogConsole';
import LogToolbar from './LogToolbar';

const logger = logging.logger('io.jenkins.blueocean.dashboard.karaoke.FreeStyle');

@observer
export default class FreeStyle extends Component {
    componentWillMount() {
        if (this.props.augmenter) {
            this.fetchData(this.props);
        }
    }
    componentWillReceiveProps(nextProps) {
        logger.debug('newProps mate');
        if (!nextProps.augmenter.karaoke) {
            this.stopKaraoke();
        }
        if (nextProps.run.isCompleted() && !this.props.run.isCompleted()) {
            logger.debug('re-fetching since result changed and we want to display the full log');
            this.pager.fetchGeneralLog({ });
        }
    }

    componentWillUnmount() {
        this.stopKaraoke();
    }

    stopKaraoke() {
        logger.debug('stopping karaoke mode, by removing the timeouts on the pager.');
        this.pager.clear();
    }

    fetchData(props) {
        const { augmenter } = props;
        this.pager = KaraokeService.generalLogPager(augmenter);
    }

    render() {
        if (this.pager.pending) {
            logger.debug('abort due to pager pending');
            return null;
        }
        const { t, router, location, scrollToBottom } = this.props;
        const { data: logArray, hasMore } = this.pager.log;
        logger.warn('props', scrollToBottom, this.pager.log.newStart);
        return (<div>
            <LogToolbar
                fileName={this.pager.generalLogFileName}
                url={this.pager.generalLogUrl}
                title={t('rundetail.pipeline.logs', { defaultValue: 'Logs' })}
            />
            <LogConsole {...{
                t,
                router,
                location,
                hasMore,
                scrollToBottom,
                logArray,
                key: this.pager.generalLogUrl,
            }}
            />
        </div>);
    }
}

FreeStyle.propTypes = {
    augmenter: PropTypes.object,
    pipeline: PropTypes.object,
    branch: PropTypes.string,
    run: PropTypes.object,
    t: PropTypes.func,
    router: PropTypes.shape,
    location: PropTypes.shape,
    scrollToBottom: PropTypes.bool,
};