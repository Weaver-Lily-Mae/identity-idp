import React, { useEffect } from 'react';
import sinon from 'sinon';
import { UploadContextProvider } from '@18f/identity-document-capture';
import withBackgroundEncryptedUpload, {
  encrypt,
} from '@18f/identity-document-capture/higher-order/with-background-encrypted-upload';
import { useSandbox } from '../../../support/sinon';
import render from '../../../support/render';

/**
 * @param {ArrayBuffer} a
 * @param {ArrayBuffer} b
 *
 * @return {boolean}
 */
function isArrayBufferEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  const aView = new DataView(a);
  const bView = new DataView(b);
  for (let i = 0; i < a.byteLength; i++) {
    if (aView.getUint8(i) !== bView.getUint8(i)) {
      return false;
    }
  }

  return true;
}

describe('withBackgroundEncryptedUpload', () => {
  const sandbox = useSandbox();

  const Component = withBackgroundEncryptedUpload(({ onChange }) => {
    useEffect(() => {
      onChange({ foo: 'bar', baz: 'quux' });
    }, []);

    return null;
  });

  describe('encrypt', () => {
    it('resolves to AES-GCM encrypted data from string value', async () => {
      const key = await window.crypto.subtle.importKey(
        'raw',
        new Uint8Array(32).buffer,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt'],
      );
      const iv = new Uint8Array(12);
      const data = 'Hello world';
      const expected = new Uint8Array([
        134,
        194,
        44,
        81,
        34,
        64,
        28,
        1,
        117,
        34,
        161,
        11,
        192,
        7,
        169,
        19,
        140,
        29,
        89,
        104,
        50,
        208,
        250,
        152,
        208,
        214,
        65,
      ]).buffer;

      const encrypted = await encrypt(key, iv, data);
      expect(isArrayBufferEqual(encrypted, expected)).to.be.true();
    });
  });

  it('intercepts onChange to include background uploads', async () => {
    const onChange = sinon.spy();
    sandbox.stub(window, 'fetch').callsFake(() => Promise.resolve({}));
    render(
      <UploadContextProvider backgroundUploadURLs={{ foo: 'about:blank' }}>
        <Component onChange={onChange} />)
      </UploadContextProvider>,
    );

    expect(onChange.calledOnce).to.be.true();
    const patch = onChange.getCall(0).args[0];
    expect(patch).to.have.keys(['foo', 'baz', 'fooBackgroundUpload']);
    expect(patch.foo).to.equal('bar');
    expect(patch.baz).to.equal('quux');
    expect(patch.fooBackgroundUpload).to.be.an.instanceOf(Promise);
    expect(window.fetch.calledOnce).to.be.true();
    expect(window.fetch.getCall(0).args).to.deep.equal([
      'about:blank',
      {
        method: 'POST',
        body: 'bar',
      },
    ]);
    expect(await patch.fooBackgroundUpload).to.be.undefined();
  });
});
