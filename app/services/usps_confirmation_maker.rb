class UspsConfirmationMaker
  def initialize(pii:, issuer:, profile:)
    @pii = pii
    @issuer = issuer
    @profile = profile
  end

  def otp
    @otp ||= generate_otp
  end

  def perform
    UspsConfirmation.create!(entry: attributes)
    UspsConfirmationCode.create!(
      profile: profile,
      otp_fingerprint: Pii::Fingerprinter.fingerprint(otp),
    )
    update_proofing_cost
  end

  private

  attr_reader :pii, :issuer, :profile

  # This method is single statement spread across many lines for readability
  def attributes
    {
      address1: pii[:address1],
      address2: pii[:address2],
      city: pii[:city],
      otp: otp,
      first_name: pii[:first_name],
      last_name: pii[:last_name],
      state: pii[:state],
      zipcode: pii[:zipcode],
      issuer: issuer,
    }
  end

  def generate_otp
    # Crockford encoding is 5 bits per character
    Base32::Crockford.encode(SecureRandom.random_number(2**(5 * 10)), length: 10)
  end

  def update_proofing_cost
    Db::ProofingCost::AddUserProofingCost.call(profile.user.id, :gpo_letter)
    Db::SpCost::AddSpCost.call(issuer, 2, :gpo_letter)
  end
end
