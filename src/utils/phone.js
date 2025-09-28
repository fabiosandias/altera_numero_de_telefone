const normalizeBrazilPhone = (rawValue) => {
  const rawString = (rawValue || '').toString();
  const cleaned = rawString.replace(/\D/g, '');

  if (!cleaned.startsWith('55')) {
    return rawString;
  }

  const fullMatch = cleaned.match(/^55(\d{2})(\d{8,9})$/);

  if (!fullMatch) {
    return rawString;
  }

  const [, ddd, subscriberDigits] = fullMatch;
  const hasNinthDigit =
    subscriberDigits.length === 9 && subscriberDigits.startsWith('9');
  const normalizedSubscriber = hasNinthDigit
    ? subscriberDigits
    : `9${subscriberDigits}`;

  return `55${ddd}${normalizedSubscriber}`;
};

module.exports = {
  normalizeBrazilPhone,
};
