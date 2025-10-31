import { google } from 'googleapis';
import { env } from '../config';

export interface GoogleReview {
  reviewer: string;
  rating: number;
  comment?: string;
  time?: string;
}

export async function fetchGoogleReviews(placeId: string): Promise<GoogleReview[]> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    console.info('Google Business Profile not configured. Returning empty review list.');
    return [];
  }

  const oauth2Client = new google.auth.OAuth2({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  });

  oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

  const myBusiness: any = google.mybusinessbusinessinformation({
    version: 'v1',
    auth: oauth2Client,
  });

  try {
    const { data } = await myBusiness.accounts.locations.reviews.list({
      parent: placeId,
      pageSize: 20,
    });

    const reviews = (data.reviews ?? []) as any[];

    return reviews.map(review => ({
      reviewer: review.reviewer?.displayName || 'Client Google',
      rating: review.starRating ? parseInt(review.starRating, 10) : 0,
      comment: review.comment,
      time: review.createTime,
    }));
  } catch (error) {
    console.error('Failed to fetch Google reviews:', error);
    return [];
  }
}
