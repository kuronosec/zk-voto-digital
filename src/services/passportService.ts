import axios from 'axios';

const VERIFICATOR_BASE_URL = process.env.REACT_APP_VERIFICATOR_URL || 'https://api.app.rarime.com';
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || 'https://app.sakundi.io';

export interface VerificationRequest {
  userId: string;
  nationality: string;
  eventId: string;
}

export interface VerificationLinkResponse {
  link: string;
  status: string;
}

export interface VerificationStatusResponse {
  status: 'pending' | 'verified' | 'failed';
  proof?: any;
}

export class PassportVerificationService {
  
  static async requestVerificationLink(request: VerificationRequest): Promise<VerificationLinkResponse> {
    const queryParams = {
      grant_type: "code",
      client_id: process.env.REACT_APP_CLIENT_ID || "hello@example.com",
      user_id: request.userId,
      redirect_uri: process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/vote/passport/callback`,
      scope: "zk-passport",
      state: String(Math.floor(Math.random() * 10000)),
      nullifier_seed: 1000,
      data: encodeURIComponent(
        JSON.stringify({
          "id": request.userId,
          "type": "user",
          "attributes": {
            "age_lower_bound": 18,
            "uniqueness": true,
            "nationality": request.nationality,
            "nationality_check": true,
            "event_id": request.eventId,
          }
        })
      )
    };

    const authUrl = `${AUTH_SERVER_URL}/authorize?` + new URLSearchParams(queryParams).toString();
    
    try {
      const response = await axios.get(authUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        link: response.data.link,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error requesting verification link:', error);
      throw new Error('Failed to request verification link');
    }
  }

  static async checkVerificationStatus(userId: string): Promise<VerificationStatusResponse> {
    try {
      const response = await axios.get(
        `${AUTH_SERVER_URL}/check-validated?user_id=${userId}&scope=zk-passport`
      );
      
      return {
        status: response.data.status,
        proof: response.data.proof
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw new Error('Failed to check verification status');
    }
  }

  static async getProofParams(proofParamsUrl: string): Promise<any> {
    try {
      const response = await axios.get(proofParamsUrl);
      return response.data;
    } catch (error) {
      console.error('Error getting proof params:', error);
      throw new Error('Failed to get proof parameters');
    }
  }

  static async exchangeCodeForToken(code: string, userId: string): Promise<any> {
    const tokenUrl = `${AUTH_SERVER_URL}/token`;
    
    const data = new URLSearchParams({
      code: code,
      client_id: process.env.REACT_APP_CLIENT_ID || "hello@example.com",
      client_secret: process.env.REACT_APP_CLIENT_SECRET || "password",
      redirect_uri: process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/vote/passport/callback`,
      scope: "zk-passport",
      grant_type: 'authorization_code'
    });

    try {
      const response = await axios.post(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  static generateDeepLink(verificationLink: string): string {
    const callbackUrl = encodeURIComponent(`${window.location.origin}/vote/passport/verify`);
    return `rarime://verify?callback=${callbackUrl}&link=${encodeURIComponent(verificationLink)}`;
  }

  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}