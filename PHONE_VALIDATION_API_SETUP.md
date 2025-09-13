# 📱 Phone Number Validation API Setup

## 🌍 Available APIs for International Phone Validation

### 1. **Abstract API (Recommended)**

- **Website**: https://www.abstractapi.com/phone-validation-api
- **Free Plan**: 100 requests/month
- **Features**:
  - Country detection
  - Carrier information
  - Line type (mobile/landline)
  - Timezone
  - Format validation

#### Setup Steps:

1. Go to https://www.abstractapi.com/phone-validation-api
2. Sign up for free account
3. Get your API key
4. Replace `YOUR_API_KEY` in the code

#### API Endpoint:

```javascript
const response = await fetch(
  `https://phonevalidation.abstractapi.com/v1/?api_key=YOUR_API_KEY&phone=${phoneNumber}`
);
const data = await response.json();

// Response includes:
// - valid: boolean
// - country: { name, code, prefix }
// - carrier: { name }
// - line_type: string
// - format: { international, local }
```

### 2. **NumVerify API**

- **Website**: https://numverify.com/
- **Free Plan**: 100 requests/month
- **Features**: Similar to Abstract API

### 3. **PhoneInfoga (Open Source)**

- **GitHub**: https://github.com/sundowndev/phoneinfoga
- **Free**: No API limits
- **Features**: Basic validation, country detection

## 🔧 How to Enable API Validation

### Step 1: Get API Key

Sign up for one of the services above and get your API key.

### Step 2: Update Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_PHONE_VALIDATION_API_KEY=your_api_key_here
NEXT_PUBLIC_PHONE_VALIDATION_API_URL=https://phonevalidation.abstractapi.com/v1/
```

### Step 3: Enable API Validation

In `src/app/register/page.tsx`, uncomment and update the API validation:

```typescript
const validatePhoneWithAPI = async (phone: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PHONE_VALIDATION_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_PHONE_VALIDATION_API_URL;

    if (!apiKey) {
      // Fallback to local validation if no API key
      return { isValid: validatePhoneNumber(phone) };
    }

    const response = await fetch(`${apiUrl}?api_key=${apiKey}&phone=${phone}`);
    const data = await response.json();

    return {
      isValid: data.valid,
      country: data.country?.name,
      carrier: data.carrier?.name,
    };
  } catch (error) {
    // Fallback to local validation if API fails
    return { isValid: validatePhoneNumber(phone) };
  }
};
```

### Step 4: Use API Validation

Replace the local validation call with API validation:

```typescript
// Instead of:
if (!validatePhoneNumber(formData.phone_number)) {

// Use:
const phoneValidation = await validatePhoneWithAPI(formData.phone_number);
if (!phoneValidation.isValid) {
  setError(`Моля въведете валиден телефонен номер. ${phoneValidation.country ? `Държава: ${phoneValidation.country}` : ''}`);
  setLoading(false);
  return;
}
```

## 📊 Current Local Validation Rules

The current local validation checks:

- ✅ Starts with `+` (international format)
- ✅ Total length: 7-15 characters
- ✅ Only digits after the `+` symbol
- ✅ Reasonable length for international numbers

## 🌟 Benefits of API Validation

1. **Real-time validation** against actual phone number databases
2. **Country detection** - know which country the number belongs to
3. **Carrier information** - identify the mobile/phone provider
4. **Line type detection** - mobile vs landline
5. **Format standardization** - get properly formatted numbers
6. **Fraud prevention** - detect fake or invalid numbers

## 💰 Cost Considerations

- **Free plans**: 100 requests/month (good for testing)
- **Paid plans**: Start from $9.99/month for 10,000 requests
- **Enterprise**: Custom pricing for high volume

## 🚀 Recommendation

Start with the **Abstract API** free plan for testing, then upgrade if you need more requests. The API validation provides much better user experience and security compared to local validation alone.
