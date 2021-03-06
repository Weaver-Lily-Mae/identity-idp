require 'rails_helper'

feature 'cac proofing present cac step' do
  include CacProofingHelper

  let(:decoded_token) do
    {
      'subject' => 'C=US, O=U.S. Government, OU=DoD, OU=PKI, CN=DOE.JOHN.1234',
      'card_type' => 'cac',
    }
  end

  before do
    simulate_piv_cac_token(decoded_token)
    sign_in_and_2fa_user
    complete_cac_proofing_steps_before_present_cac_step
  end

  it 'is on the correct page' do
    expect(page).to have_current_path(idv_cac_proofing_present_cac_step)
  end

  it 'proceeds to the next page with a CAC' do
    click_link t('forms.buttons.cac')

    expect(page.current_url.include?("/\?nonce=")).to eq(true)

    visit idv_cac_step_path(step: :present_cac, token: 'foo')

    expect(page.current_path).to eq(idv_cac_proofing_enter_info_step)

    expect(DocAuthLog.first.present_cac_submit_count).to eq(1)
    expect(DocAuthLog.first.present_cac_error_count).to eq(0)
  end

  it 'does not proceed to the next page with a bad CAC and allows doc auth' do
    simulate_piv_cac_token({})

    click_link t('forms.buttons.cac')

    expect(page.current_url.include?("/\?nonce=")).to eq(true)

    visit idv_cac_step_path(step: :present_cac, token: 'foo')

    expect(page.current_path).to eq(idv_cac_proofing_present_cac_step)
    expect(page).to have_link(t('cac_proofing.errors.state_id'), href: idv_doc_auth_path)

    expect(DocAuthLog.first.present_cac_submit_count).to eq(2)
    expect(DocAuthLog.first.present_cac_error_count).to eq(1)
  end

  it 'does proceed to the next page if card_type is PIV' do
    decoded_token_piv = {
      'subject' => 'C=US, O=U.S. Government, OU=DoD, OU=PKI, CN=DOE.JOHN.1234',
      'card_type' => 'piv',
    }
    simulate_piv_cac_token(decoded_token_piv)

    click_link t('forms.buttons.cac')

    expect(page.current_url.include?("/\?nonce=")).to eq(true)

    visit idv_cac_step_path(step: :present_cac, token: 'foo')

    expect(page.current_path).to eq(idv_cac_proofing_enter_info_step)
  end
end
