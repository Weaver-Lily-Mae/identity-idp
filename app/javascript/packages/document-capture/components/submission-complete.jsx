import React from 'react';
import CallbackOnMount from './callback-on-mount';
import SubmissionInterstitial from './submission-interstitial';

/** @typedef {import('../context/upload').UploadSuccessResponse} UploadSuccessResponse */

/**
 * @typedef Resource
 *
 * @prop {()=>T} read Resource reader.
 *
 * @template T
 */

/**
 * @typedef SubmissionCompleteProps
 *
 * @prop {Resource<UploadSuccessResponse>} resource Resource object.
 */

export class RetrySubmissionError extends Error {}

/**
 * Interval after which to retry submission, in milliseconds.
 *
 * @type {number}
 */
const RETRY_INTERVAL = 2500;

/**
 * Returns a promise resolving after given timeout.
 *
 * @param {number} ms Timeout in millseconds.
 *
 * @return {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {SubmissionCompleteProps} props Props object.
 */
function SubmissionComplete({ resource }) {
  const response = resource.read();

  if (response.status === 'in_progress') {
    throw sleep(RETRY_INTERVAL).then(() => {
      throw new RetrySubmissionError();
    });
  }

  function submitCaptureForm() {
    /** @type {HTMLFormElement?} */
    const form = document.querySelector('.js-document-capture-form');
    form?.submit();
  }

  return (
    <>
      <SubmissionInterstitial />
      <CallbackOnMount onMount={submitCaptureForm} />
    </>
  );
}

export default SubmissionComplete;
