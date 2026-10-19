/**
 * The single source for the contact-consent disclosure.
 *
 * WHY THIS IS ONE CONSTANT
 * Zolato's leads API requires `consent.text` whenever sms or email consent is
 * true: "send the exact wording the person agreed to". That requirement only
 * means anything if the string we transmit is the string the visitor actually
 * saw. So the forms render this constant and the lead endpoint sends this same
 * constant, and neither has its own copy to drift from.
 *
 * If you change the wording, you are changing what every future lead is
 * recorded as having agreed to. Leads captured before the change keep the
 * wording that was shown to them only if you version this rather than edit it
 * in place; see CONSENT_VERSION below.
 *
 * WHY IT IS WORDED THIS WAY
 * Consent collected by submitting a form, with the disclosure visible next to
 * the submit button, is the standard "unambiguous consent" pattern. For it to
 * hold up the disclosure has to name the business, say which channels are
 * covered, note that automated messages may be used, state that consent is not
 * required to buy anything, and give a way out. All five are below. Dropping
 * any of them weakens the consent this records.
 *
 * It is displayed next to the submit control on every form, which is the part
 * that makes the record truthful. Do not transmit consent from a form that
 * does not show it.
 */

export const CONSENT_VERSION = "2026-10-19";

export const CONSENT_TEXT =
  "By submitting this form, you agree that Monarch Pro Wash may contact you by phone, text message, and email about your request, including by automated means. Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out at any time.";

/** Shorter line for tight layouts. Still names the channels and the opt-out. */
export const CONSENT_TEXT_SHORT = CONSENT_TEXT;
