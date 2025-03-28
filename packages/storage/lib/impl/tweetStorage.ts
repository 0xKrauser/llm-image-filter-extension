import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type TweetContent = {
  text: string;
  images: string[];
};

export type Tag = {
  id: string;
  value: boolean;
  mandatory: boolean;
};

export type Tweet = {
  statusId: string;
  tweetContent?: TweetContent;
  extracted?: boolean;
  tagged?: boolean;
  tags?: Tag[][];
  createdAt: number;
};

export type TweetStorage = BaseStorage<Record<string, Tweet>> & {
  setTweet: (statusId: string, tweetContent: Tweet) => Promise<void>;
  getTweet: (statusId: string) => Promise<Tweet | undefined>;
  deleteTweet: (statusId: string) => Promise<void>;
  deleteExpiredTweets: (expirationTime: number) => Promise<void>;
};

const storage = createStorage<Record<string, Tweet>>(
  'tweet_storage',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// You can extend it with your own methods
export const tweetStorage: TweetStorage = {
  ...storage,
  getTweet: async (statusId: string) => {
    const tweets = await storage.get();
    const tweet = tweets[statusId];
    return tweet;
  },
  setTweet: async (statusId: string, tweet: Tweet) => {
    const tweets = await storage.get();
    if (tweets[statusId]) {
      tweets[statusId] = { ...tweets[statusId], ...tweet };
    } else {
      tweets[statusId] = tweet;
    }
    await storage.set(tweets);
  },
  deleteTweet: async (statusId: string) => {
    const tweets = await storage.get();
    delete tweets[statusId];
    await storage.set(tweets);
  },
  deleteExpiredTweets: async (expirationTime: number) => {
    const tweets = await storage.get();
    const now = Date.now();
    Object.entries(tweets).forEach(([statusId, value]) => {
      if (now - value.createdAt > expirationTime) {
        delete tweets[statusId];
      }
    });
    await storage.set(tweets);
  },
};
