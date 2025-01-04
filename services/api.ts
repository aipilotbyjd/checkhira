import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://hirabook.icu/api/v1';

const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5ZGUzNGU4NC1iOGZlLTQxMjUtYmRiMS1mMGY5NTE2YTk5ZTQiLCJqdGkiOiIxYzY1YTcwMDIxYjc1NmExNWE3NDEwNDAwNjI5YzNhMjNiODg5YzVkNjM3NDgyMzFkZmIwMGM3YWU4ZDNiMmUzNmUwZGIyMzA2MmU1MDNkYSIsImlhdCI6MTczNTk5NjE5NS40ODcyMzksIm5iZiI6MTczNTk5NjE5NS40ODcyNDEsImV4cCI6MTc1MTYzNDU5NS40ODI3NjgsInN1YiI6IjEiLCJzY29wZXMiOltdfQ.dRDFE7SfhH2l4FHpn2yZd6_Soc5XqKP1x0lYra5W7eRnCmEGA65pkSDjm2UuSFg8rUKDaLSV5OlZ_AykcU8ULbUEJmgUGef0mo7CUvFtUBGsBmGJllIjjlcSeTyPa99mfaVWRfKC7JSACBtm-nga-1ZbOSvRtre1LgEkZ77jDgdW3JTrCH-ABJH6Q-Ou0TAfZRo0U3SybrwdtxKSZHVuhrMJXTQN_MvKY--i12zOYaWlJRma2M6i1Fz_ujjBLFEtYR-OIN9a6TP_zKVTHEMXg-FkTJSkZtHdfagxq0hEHx8sXrF71Y4q8KMhdUEz-e6xL49i6WVm-VnYbOWkD00hMoX3lueX_ZeUNAi5fxD824R3bDCSk3elAxN8mrS0BKFbXzd0kIoBd5bpUpUc6VIIlJSlWDw-BG48wyoxInQLVBPBYXz8CsFgHvcX4BTdKoohNqlW-bQc0PQn2UReHd3iDIa4CXKd5jOJ39779ywRhG2IuT5KwaSK3sBBskrdTAU5r0S-FDHc3rEGk3gc5G3v00gW_-qbhqZU1PrnOUt4TSVLkb3J1HYCW1x1aNopOTumHx6xMt3inv3etiweDi7uY92-A3PiQCWjI-fESo1OaybDbTnT-9OmYT7LzIWHKa88BmnZ0zuXfdar_prL_RCKqHmYVmveQW9EGUhwPd_e19M';

export const api = {
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
    // Add any authentication headers here
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
