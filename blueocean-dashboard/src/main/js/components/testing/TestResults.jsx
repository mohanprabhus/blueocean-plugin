import React, { Component, PropTypes } from 'react';
import { ResultItem, StatusIndicator } from '@jenkins-cd/design-language';
import { TestSummary } from './TestSummary';
import moment from 'moment';
// needs to be loaded since the moment lib will use require which in run time will fail
import 'moment/min/locales.min';

/* eslint-disable max-len */

const ConsoleLog = ({ text, className, key = 'console' }) =>
     <div className={`${className} console-log insert-line-numbers`}>
        {text.trim().split('\n').map((line, idx) =>
            <div className="line" id={`#${key}-L${idx}`} key={`#${key}-L${idx}`}>{line}</div>
        )}
    </div>;

ConsoleLog.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string,
    key: PropTypes.string,
};

const TestCaseResultRow = (props) => {
    const { testCase: t, translation, locale = 'en' } = props;
    moment.locale(locale);
    const duration = moment.duration(Number(t.duration), 'milliseconds').humanize();

    let testDetails = null;
    if (t.errorStackTrace || t.errorDetails || t.stdout || t.stderr) {
        testDetails = (<div>
            <div className="test-details">
                <div className="test-detail-text" style={{ display: 'none' }}>
                    {duration}
                </div>
            </div>
            <div className="test-console">
                {t.errorDetails && <h4>{translation('rundetail.tests.results.error.message', { defaultValue: 'Error' })}</h4>}
                {t.errorDetails && <ConsoleLog className="error-message" text={t.errorDetails} key={`${t}-message`} />}
                {t.errorStackTrace && <h4>{translation('rundetail.tests.results.error.output', { defaultValue: 'Stacktrace' })}</h4>}
                {t.errorStackTrace && <ConsoleLog className="stack-trace" text={t.errorStackTrace} key={`${t}-stack-trace`} />}
                {t.stdout && <h4>{translation('rundetail.tests.results.error.stdout', { defaultValue: 'Standard Output' })}</h4>}
                {t.stdout && <ConsoleLog className="stack-trace" text={t.stdout} key={`${t}-stdout`} />}
                {t.stderr && <h4>{translation('rundetail.tests.results.error.stderr', { defaultValue: 'Standard Error' })}</h4>}
                {t.stderr && <ConsoleLog className="stack-trace" text={t.stderr} key={`${t}-stderr`} />}
            </div>
        </div>);
    }

    let statusIndicator = null;
    switch (t.status) {
    case 'REGRESSION':
    case 'FAILED':
        statusIndicator = StatusIndicator.validResultValues.failure;
        break;
    case 'SKIPPED':
        statusIndicator = StatusIndicator.validResultValues.unstable;
        break;
    case 'FIXED':
    case 'PASSED':
        statusIndicator = StatusIndicator.validResultValues.success;
        break;
    default:
    }

    return (<ResultItem
      result={statusIndicator}
      expanded={false}
      label={ `${t.name}` }
      onExpand={null}
      extraInfo={duration}
    >
        { testDetails }
    </ResultItem>);
};

TestCaseResultRow.propTypes = {
    testCase: PropTypes.object,
    translation: PropTypes.func,
    locale: PropTypes.string,
};

export default class TestResult extends Component {

    render() {
        const { t: translation, testResults, locale } = this.props;
        const suites = this.props.testResults.suites;
        const tests = [].concat.apply([], suites.map(t => t.cases));

        // one of 5 possible statuses: PASSED, FIXED, SKIPPED, FAILED, REGRESSION  see: hudson.tasks.junit.CaseResult$Status :(
        const fixed = tests.filter(t => t.status === 'FIXED');
        const skipped = tests.filter(t => t.status === 'SKIPPED');
        const newFailures = tests.filter(t => (t.age <= 1 && t.status === 'FAILED') || t.status === 'REGRESSION');
        const existingFailures = tests.filter(t => t.age > 1 && t.status === 'FAILED');

        let newFailureBlock = null;
        let existingFailureBlock = null;
        let fixedBlock = null;
        let skippedBlock = null;

        const summaryBlock = (
            <TestSummary
                translate={translation}
                passing={testResults.passCount}
                fixed={fixed.length}
                failuresNew={newFailures.length}
                failuresExisting={existingFailures.length}
                skipped={testResults.skipCount}
            />
        );

        if (newFailures.length > 0) {
            newFailureBlock = (<div className="test-result-block new-failure-block">
                <h4>{translation('rundetail.tests.results.errors.new.count', {
                    0: newFailures.length,
                    defaultValue: 'New failing - {0}',
                })}</h4>
                {newFailures.map((t, i) => <TestCaseResultRow key={i} testCase={t} translation={translation} locale={locale} />)}
            </div>);
        }

        if (existingFailures.length > 0) {
            existingFailureBlock = (<div className="test-result-block existing-failure-block">
                <h4>{translation('rundetail.tests.results.errors.existing.count', {
                    0: existingFailures.length,
                    defaultValue: 'Existing failures - {0}',
                })}</h4>
                {existingFailures.map((t, i) => <TestCaseResultRow key={i} testCase={t} translation={translation} locale={locale} />)}
            </div>);
        }

        if (skipped.length > 0) {
            skippedBlock = (<div className="test-result-block skipped-block">
                <h4>{translation('rundetail.tests.results.skipped.count', {
                    0: skipped.length,
                    defaultValue: 'Skipped - {0}',
                })}</h4>
                {skipped.map((t, i) => <TestCaseResultRow key={i} testCase={t} translation={translation} locale={locale} />)}
            </div>);
        }

        // always show fixed, whether showing totals or the encouraging message
        if (fixed.length > 0) {
            fixedBlock = (<div className="test-result-block fixed-block">
                <h4>{translation('rundetail.tests.results.fixed', { defaultValue: 'Fixed' })}</h4>
                {fixed.map((t, i) => <TestCaseResultRow key={i} testCase={t} translation={translation} locale={locale} />)}
            </div>);
        }

        return (
            <div>
                {summaryBlock}
                {newFailureBlock}
                {existingFailureBlock}
                {fixedBlock}
                {skippedBlock}
            </div>
        );
    }
}

TestResult.propTypes = {
    testResults: PropTypes.object,
    t: PropTypes.func,
    locale: PropTypes.string,
};
