import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://hirabook.icu/api/v1';
// const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://api.hirabook.icu/public/api';

const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5ZGZkZGJkMC1iNDNiLTQ1OTctODA0Ny03NTU4YTk0YzBhMGUiLCJqdGkiOiJkY2NmNmJkYzU3NmE1Yzc3YWIxNTYwNmIyN2MyZWJiZjBkMzBhZDA2MTg1MmUzOTNjOTY1YmQ2NWE0MTI0ZDVhYmYyOTBjOWM2YmZiMDIwOCIsImlhdCI6MTczNzEzOTEwOC43OTk0OCwibmJmIjoxNzM3MTM5MTA4Ljc5OTQ4MzEsImV4cCI6MTc1Mjc3NzUwOC43ODYzNDQxLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.OLZ8pN8APca-CshEmnit5ZpdgovZsNYyW1aQheFMSUmZyEYEfNtuyQc3gK5dsU97Iilybn-Df04pUR6KwlPPIpcdBrzr-f3-Q1fXNVQPpAlCA_Rh2j4-0Cis7B5yZ3mQ8AR5282jCky3DLfpay8ul92rAlBqnk-Zp5Q9Fpik-B8Wj43GXxyCaqb5rolzS9pGvY3pCYA-mDO6YToHoygZtK-lEBezTva_dS8nOI0idMUMQrqOnjf3KiyMOKcSEipu713ZWo8yhhtB2e_D-53INEdPZmORM9egw2TR4Rm4Llx1EvEP5opofk4uAe9MWkchmuJGnrjc_akKivI__3tW8I0hQF-LpnNdlAwMoTl-HljvKLAhr_RBnTbkWxvx1vBGGq3xhRkPX8yyB5Pa6co6SxaQzSd-kDwmLYLgRngPW053QXQCfT-d6h8KOZk18WWuYV0OimwNkh6cVaiP_nntV9E8vCJMfN6Fw5McK4v0fZHMh1I7pqx6tsY6ThCUmmL33o0uCchoBuAxOtwh61AcVyLcRiTzycstslBERflc5JWrrSzjsdFvNjjzTw2FpcBxU0AOX9cSXM49MlojWT490LsmQdybCn_ztcFR2EEa4e3BtBXhMnogn93GHGWHSFziXiseMCXwcEgcxmXg89lAxAJiz52FxqT2z0fhZTkHCrw';

export const api = {
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || 'An error occurred');
  }
  return response.json();
}
