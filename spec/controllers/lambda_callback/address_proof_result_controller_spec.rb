require 'rails_helper'

describe LambdaCallback::AddressProofResultController do
  describe '#create' do
    let(:document_capture_session) { DocumentCaptureSession.new(user: create(:user)) }

    context 'with valid API token' do
      before do
        request.headers['X-API-AUTH-TOKEN'] = Figaro.env.address_proof_result_lambda_token
      end

      it 'accepts and stores successful address proofing results' do
        applicant = { phone: Faker::PhoneNumber.cell_phone }
        document_capture_session.store_proofing_pii_from_doc(applicant)
        Idv::Agent.new(applicant).proof_address(document_capture_session)
        proofer_result = document_capture_session.load_proofing_result[:result]

        post :create, params: { result_id: document_capture_session.result_id,
                                address_result: proofer_result.to_h }

        proofing_result = document_capture_session.load_proofing_result
        expect(proofing_result.result).to include({ exception: '', success: 'true' })
      end

      it 'accepts and stores unsuccessful address proofing results' do
        applicant = {
          phone: IdentityIdpFunctions::AddressMockClient::UNVERIFIABLE_PHONE_NUMBER,
        }

        document_capture_session.store_proofing_pii_from_doc(applicant)
        Idv::Agent.new(applicant).proof_address(document_capture_session)
        proofer_result = document_capture_session.load_proofing_result[:result]

        post :create, params: { result_id: document_capture_session.result_id,
                                address_result: proofer_result.to_h }

        proofing_result = document_capture_session.load_proofing_result
        expect(proofing_result.result[:success]).to eq 'false'
        expect(proofing_result.result[:errors]).to eq(
          { phone: ['The phone number could not be verified.'] },
        )
      end

      it 'sends notifications if result includes exceptions' do
        expect(NewRelic::Agent).to receive(:notice_error)
        expect(ExceptionNotifier).to receive(:notify_exception)

        applicant = {
          phone: IdentityIdpFunctions::AddressMockClient::PROOFER_TIMEOUT_PHONE_NUMBER,
        }

        document_capture_session.store_proofing_pii_from_doc(applicant)
        Idv::Agent.new(applicant).proof_address(document_capture_session)
        proofer_result = document_capture_session.load_proofing_result[:result]

        post :create, params: { result_id: document_capture_session.result_id,
                                address_result: proofer_result.to_h }

        proofing_result = document_capture_session.load_proofing_result
        expect(proofing_result.result[:exception]).to start_with('#<Proofer::TimeoutError: ')
      end
    end

    context 'with invalid API token' do
      before do
        request.headers['X-API-AUTH-TOKEN'] = 'zyx'
      end

      it 'returns unauthorized error' do
        post :create, params: { result_id: 'abc123', address_result: {} }

        expect(response.status).to eq 401
      end
    end
  end
end
