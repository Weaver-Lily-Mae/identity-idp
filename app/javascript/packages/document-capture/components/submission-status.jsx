import React, { useContext } from 'react';
import useAsync from '../hooks/use-async';
import UploadContext from '../context/upload';
import SuspenseErrorBoundary from './suspense-error-boundary';
import SubmissionComplete from './submission-complete';
import SubmissionInterstitial from './submission-interstitial';
import CallbackOnMount from './callback-on-mount';

/**
 * @typedef SubmissionStatusProps
 *
 * @prop {(error:Error)=>void} onError Error callback.
 */

/**
 * @param {SubmissionStatusProps} props Props object.
 */
function SubmissionStatus({ onError }) {
  const { getStatus } = useContext(UploadContext);
  const resource = useAsync(getStatus);

  return (
    <SuspenseErrorBoundary
      fallback={<SubmissionInterstitial autoFocus />}
      errorFallback={({ error }) => <CallbackOnMount onMount={() => onError(error)} />}
    >
      <SubmissionComplete resource={resource} />
    </SuspenseErrorBoundary>
  );
}

export default SubmissionStatus;
